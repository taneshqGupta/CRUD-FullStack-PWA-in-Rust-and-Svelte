<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import type { Post } from '$lib/types';

    export let posts: Post[] = [];
    export let center: [number, number] = [20.5937, 78.9629]; // Center of India
    export let zoom: number = 5;
    export let height: string = '400px';
    export let onLocationSelect: ((lat: number, lng: number, address?: string) => void) | null = null;

    let mapContainer: HTMLDivElement;
    let map: any = null;
    let L: any = null;
    let markers: any[] = [];
    let currentLocationMarker: any = null;

    // Different marker colors for different post types
    const markerColors = {
        offer: '#10b981', // emerald-500
        request: '#f59e0b' // amber-500
    };

    onMount(async () => {
        if (browser) {
            // Dynamic import of Leaflet to avoid SSR issues
            L = await import('leaflet');
            
            // Import default CSS
            await import('leaflet/dist/leaflet.css');
            
            // Fix default markers (Leaflet issue with bundlers)
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            });

            initializeMap();
            getUserLocation();
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
    });

    function initializeMap() {
        // Create map
        map = L.map(mapContainer).setView(center, zoom);

        // Add beautiful OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Add click handler for location selection
        if (onLocationSelect) {
            map.on('click', async (e: any) => {
                const { lat, lng } = e.latlng;
                
                // Reverse geocode to get address
                try {
                    const address = await reverseGeocode(lat, lng);
                    onLocationSelect(lat, lng, address || undefined);
                    
                    // Add/update current location marker
                    if (currentLocationMarker) {
                        map.removeLayer(currentLocationMarker);
                    }
                    
                    currentLocationMarker = L.marker([lat, lng])
                        .bindPopup(`<b>Selected Location</b><br>${address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}`)
                        .addTo(map);
                } catch (error) {
                    console.error('Error getting address:', error);
                    onLocationSelect(lat, lng);
                }
            });
        }

        // Add posts as markers
        updateMarkers();
    }

    async function getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setView([latitude, longitude], 12);
                    
                    // Add user location marker
                    L.marker([latitude, longitude])
                        .bindPopup('<b>Your Location</b>')
                        .addTo(map);
                },
                (error) => {
                    console.log('Geolocation not available or denied');
                }
            );
        }
    }

    async function geocodePinCode(pinCode: string): Promise<[number, number] | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&postalcode=${pinCode}&limit=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (error) {
            console.error('Error geocoding pin code:', error);
        }
        return null;
    }

    async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.display_name) {
                return data.display_name;
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
        }
        return null;
    }

    function createCustomIcon(postType: 'offer' | 'request') {
        const color = markerColors[postType];
        const icon = postType === 'offer' ? '💡' : '🙋';
        
        return L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="
                    background-color: ${color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    font-size: 14px;
                ">${icon}</div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    async function updateMarkers() {
        if (!map || !L) return;

        // Clear existing markers
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        // Add new markers for posts with pin codes
        for (const post of posts) {
            if (post.pin_code) {
                const coordinates = await geocodePinCode(post.pin_code);
                if (coordinates) {
                    const icon = createCustomIcon(post.post_type);
                    const marker = L.marker(coordinates, { icon })
                        .bindPopup(`
                            <div class="p-2">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="badge ${post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'} badge-sm">
                                        ${post.post_type === 'offer' ? '💡 Offering' : '🙋 Requesting'}
                                    </span>
                                    <span class="badge badge-outline badge-sm">📍 ${post.pin_code}</span>
                                </div>
                                <p class="font-semibold text-sm">${post.description}</p>
                                <p class="text-xs opacity-70">Category: ${post.category}</p>
                                ${post.user_name ? `<p class="text-xs opacity-70">By: ${post.user_name}</p>` : ''}
                                ${post.completed ? '<p class="text-xs text-success">✅ Completed</p>' : ''}
                            </div>
                        `)
                        .addTo(map);
                    
                    markers.push(marker);
                }
            }
        }
    }

    // Reactive statement to update markers when posts change
    $: if (map && posts) {
        updateMarkers();
    }

    export function focusOnPinCode(pinCode: string) {
        if (map && pinCode) {
            geocodePinCode(pinCode).then(coordinates => {
                if (coordinates) {
                    map.setView(coordinates, 14);
                    
                    // Highlight the marker if it exists
                    const marker = markers.find(m => {
                        const pos = m.getLatLng();
                        return Math.abs(pos.lat - coordinates[0]) < 0.001 && 
                               Math.abs(pos.lng - coordinates[1]) < 0.001;
                    });
                    
                    if (marker) {
                        marker.openPopup();
                    }
                }
            });
        }
    }
</script>

<div bind:this={mapContainer} style="height: {height}; width: 100%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>

<style>
    :global(.custom-marker) {
        background: none !important;
        border: none !important;
    }
    
    :global(.leaflet-popup-content-wrapper) {
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }
    
    :global(.leaflet-popup-content) {
        margin: 8px 12px;
        font-family: inherit;
    }
    
    :global(.leaflet-popup-tip) {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
