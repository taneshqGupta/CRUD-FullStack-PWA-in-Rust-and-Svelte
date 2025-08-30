use anyhow::Result;
use reqwest::multipart;
use serde_json::Value;
use std::collections::HashMap;
use base64::prelude::*;

#[derive(Debug, Clone)]
pub struct CloudinaryConfig {
    pub cloud_name: String,
    pub api_key: String,
    pub api_secret: String,
}

impl CloudinaryConfig {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            cloud_name: std::env::var("CLOUDINARY_CLOUD_NAME")
                .map_err(|_| anyhow::anyhow!("CLOUDINARY_CLOUD_NAME not set"))?,
            api_key: std::env::var("CLOUDINARY_API_KEY")
                .map_err(|_| anyhow::anyhow!("CLOUDINARY_API_KEY not set"))?,
            api_secret: std::env::var("CLOUDINARY_API_SECRET")
                .map_err(|_| anyhow::anyhow!("CLOUDINARY_API_SECRET not set"))?,
        })
    }
}

pub struct CloudinaryService {
    config: CloudinaryConfig,
    client: reqwest::Client,
}

impl CloudinaryService {
    pub fn new(config: CloudinaryConfig) -> Self {
        Self {
            config,
            client: reqwest::Client::new(),
        }
    }

    pub async fn upload_image(&self, base64_data: &str, public_id: Option<String>) -> Result<String> {
        // Remove data URL prefix if present
        let image_data = if base64_data.starts_with("data:") {
            base64_data.split(',').nth(1).unwrap_or(base64_data)
        } else {
            base64_data
        };

        // Decode base64 to bytes
        let image_bytes = BASE64_STANDARD.decode(image_data)
            .map_err(|e| anyhow::anyhow!("Failed to decode base64: {}", e))?;

        // Generate timestamp for signed upload
        let timestamp = chrono::Utc::now().timestamp();
        let timestamp_str = timestamp.to_string();

        // Create parameters for signature
        let mut params_for_signature = std::collections::HashMap::new();
        params_for_signature.insert("timestamp", timestamp_str.as_str());
        params_for_signature.insert("folder", "profile_pictures");
        params_for_signature.insert("transformation", "c_fill,w_300,h_300,f_auto,q_auto");
        
        if let Some(ref id) = public_id {
            params_for_signature.insert("public_id", id);
        }

        // Generate signature
        let signature = self.generate_signature(&params_for_signature)?;

        // Create multipart form with signed parameters
        let mut form = multipart::Form::new()
            .part("file", multipart::Part::bytes(image_bytes).file_name("profile.jpg"))
            .text("timestamp", timestamp_str)
            .text("api_key", self.config.api_key.clone())
            .text("signature", signature)
            .text("folder", "profile_pictures")
            .text("transformation", "c_fill,w_300,h_300,f_auto,q_auto");

        // Add public_id if provided
        if let Some(id) = public_id {
            form = form.text("public_id", id);
        }

        let url = format!("https://api.cloudinary.com/v1_1/{}/image/upload", self.config.cloud_name);

        let response = self.client
            .post(&url)
            .multipart(form)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Cloudinary upload failed: {}", error_text));
        }

        let json: Value = response.json().await?;
        
        let secure_url = json["secure_url"]
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("No secure_url in Cloudinary response"))?;

        Ok(secure_url.to_string())
    }

    pub async fn delete_image(&self, public_id: &str) -> Result<()> {
        let url = format!("https://api.cloudinary.com/v1_1/{}/image/destroy", self.config.cloud_name);
        
        let timestamp = chrono::Utc::now().timestamp();
        let timestamp_str = timestamp.to_string();
        
        let mut params = HashMap::new();
        params.insert("public_id", public_id);
        params.insert("timestamp", timestamp_str.as_str());
        
        // Generate signature
        let signature = self.generate_signature(&params)?;
        params.insert("signature", &signature);
        params.insert("api_key", &self.config.api_key);

        let response = self.client
            .post(&url)
            .form(&params)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Cloudinary delete failed: {}", error_text));
        }

        Ok(())
    }

    fn generate_signature(&self, params: &HashMap<&str, &str>) -> Result<String> {
        use std::collections::BTreeMap;
        
        // Sort parameters for signature generation (exclude api_key and signature)
        let sorted_params: BTreeMap<_, _> = params.iter()
            .filter(|(k, _)| **k != "api_key" && **k != "signature")
            .collect();
        
        // Create query string
        let query_string = sorted_params
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect::<Vec<_>>()
            .join("&");
        
        let to_sign = format!("{}{}", query_string, self.config.api_secret);
        
        // Generate SHA1 hash (Cloudinary requires SHA1)
        use sha1::{Sha1, Digest};
        let mut hasher = Sha1::new();
        hasher.update(to_sign.as_bytes());
        let hash = hasher.finalize();
        
        Ok(format!("{:x}", hash))
    }
}
