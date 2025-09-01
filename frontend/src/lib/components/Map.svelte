<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import type { Post } from '$lib/types';
    import { PinSvg } from '$lib/components/icons';

    export let posts: Post[] = [];
    export let center: [number, number] = [20.5937, 78.9629]; // Center of India
    export let zoom: number = 5;
    export let height: string = '400px';
    export let onLocationSelect: ((lat: number, lng: number, address?: string) => void) | null = null;
    export let userPinCode: string = ''; // User's default pin code to auto-focus

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
        // Create map with scroll zoom disabled
        map = L.map(mapContainer, {
            scrollWheelZoom: false,
            doubleClickZoom: true,
            touchZoom: true,
            boxZoom: true,
            keyboard: true
        }).setView(center, zoom);

        // Add beautiful OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Add zoom control
        L.control.zoom({
            position: 'topright'
        }).addTo(map);

        // Focus on user's pin code if provided
        if (userPinCode) {
            focusOnUserPinCode();
        }

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

    async function focusOnUserPinCode() {
        if (map && userPinCode) {
            const coordinates = await geocodePinCode(userPinCode);
            if (coordinates) {
                map.setView(coordinates, 12);
            }
        }
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
        const icon = postType === 'offer' ? '' : '';
        
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

        // Group posts by pin code
        const postsByPinCode: { [pinCode: string]: Post[] } = {};
        posts.forEach(post => {
            if (post.pin_code) {
                if (!postsByPinCode[post.pin_code]) {
                    postsByPinCode[post.pin_code] = [];
                }
                postsByPinCode[post.pin_code].push(post);
            }
        });

        // Create markers for each pin code location
        for (const [pinCode, postsAtLocation] of Object.entries(postsByPinCode)) {
            const coordinates = await geocodePinCode(pinCode);
            if (coordinates) {
                // Count offers and requests
                const offerCount = postsAtLocation.filter(p => p.post_type === 'offer').length;
                const requestCount = postsAtLocation.filter(p => p.post_type === 'request').length;
                
                // Create custom icon that shows both counts
                const icon = createCombinedIcon(offerCount, requestCount);
                
                // Create popup content with all posts
                const popupContent = `
                    <div class="p-3 max-w-sm">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="badge badge-outline badge-sm"><div class="inline-flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>Pin Code: ${pinCode}</div></span>
                            <span class="text-xs">${offerCount} offers, ${requestCount} requests</span>
                        </div>
                        <div class="space-y-2 max-h-60 overflow-y-auto">
                            ${postsAtLocation.map(post => `
                                <div class="border border-base-300 rounded-lg p-2">
                                    <div class="flex items-center gap-2 mb-1">
                                        <span class="badge ${post.post_type === 'offer' ? 'badge-primary' : 'badge-secondary'} badge-xs">
                                            <div class="badge badge-ghost">${post.post_type === 'offer' ? 'Offer' : 'Request'}</div>
                                        </span>
                                        <span class="text-xs font-medium">${post.category}</span>
                                    </div>
                                    <p class="text-sm">${post.description}</p>
                                    ${post.user_name ? `<p class="text-xs opacity-70 mt-1">By: ${post.user_name}</p>` : ''}
                                    ${post.completed ? '<p class="text-xs text-success mt-1">Completed</p>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                
                const marker = L.marker(coordinates, { icon })
                    .bindPopup(popupContent)
                    .addTo(map);
                
                markers.push(marker);
            }
        }
    }

    function createCombinedIcon(offerCount: number, requestCount: number) {
        const size = Math.min(Math.max(20 + (offerCount + requestCount) * 2, 25), 40);
        
        return L.divIcon({
            className: 'combined-marker',
            html: `
                <div style="
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    border: 2px solid #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${Math.max(10, size * 0.3)}px;
                    font-weight: bold;
                    color: white;
                    text-shadow: 1px 1px 1px rgba(0,0,0,0.7);
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                    background: ${offerCount > requestCount ? 
                        'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : 
                        requestCount > offerCount ?
                        'linear-gradient(135deg, #059669 0%, #0d9488 100%)' :
                        'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)'
                    };
                    position: relative;
                " title="${offerCount} offers, ${requestCount} requests">
                    <span style="position: absolute; top: -2px; left: 50%; transform: translateX(-50%); font-size: 8px;">
                        ${offerCount > 0 ? '' : ''}${requestCount > 0 ? '' : ''}
                    </span>
                    <span style="margin-top: 4px;">${offerCount + requestCount}</span>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2],
            popupAnchor: [0, -size/2]
        });
    }

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
