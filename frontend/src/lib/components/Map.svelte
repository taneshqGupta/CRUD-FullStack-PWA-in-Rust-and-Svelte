<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { mount } from "svelte";
    import type { Post } from "$lib/types";
    import PopupContent from "./PopupContent.svelte";
    import MarkerIcon from "./MarkerIcon.svelte";

    export let posts: Post[] = [];
    export let center: [number, number] = [20.5937, 78.9629]; // Center of India
    export let zoom: number = 5;
    export let height: string = "400px";
    export let onLocationSelect:
        | ((lat: number, lng: number, address?: string) => void)
        | null = null;
    export let userPinCode: string = ""; // User's default pin code to auto-focus

    let mapContainer: HTMLDivElement;
    let map: any = null;
    let L: any = null;
    let markers: any[] = [];
    let currentLocationMarker: any = null;

    let themeObserver: MutationObserver | null = null;

    onMount(async () => {
        if (browser) {
            L = await import("leaflet");

            await import("leaflet/dist/leaflet.css");

            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl:
                    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            });

            initializeMap();
            getUserLocation();

            // Watch for theme changes
            themeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                        updateTileLayer();
                    }
                });
            });

            themeObserver.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
            });
        }
    });

    onDestroy(() => {
        if (map) {
            map.remove();
        }
        if (themeObserver) {
            themeObserver.disconnect();
        }
    });

    let currentTileLayer: any = null;

    function getThemeType(): 'light' | 'dim' | 'dark' | 'retro' | 'valentine' {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'forest') return 'dark';
        if (theme === 'dim') return 'dim';
        if (theme === 'retro') return 'retro';
        if (theme === 'valentine') return 'valentine';
        return 'light';
    }

    function updateTileLayer() {
        if (map && currentTileLayer) {
            map.removeLayer(currentTileLayer);
        }
        
        const themeType = getThemeType();
        
        if (themeType === 'dark') {
            // Dark theme (forest) - use light tiles with dark theme color overlay
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20,
                className: 'dark-map-filter'
            });
        } else if (themeType === 'dim') {
            // Dim theme - use light tiles with dim theme background overlay
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20,
                className: 'dim-map-filter'
            });
        } else if (themeType === 'retro') {
            // Retro theme - warm vintage colors
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20,
                className: 'retro-map-filter'
            });
        } else if (themeType === 'valentine') {
            // Valentine theme - romantic pink/red tones
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20,
                className: 'valentine-map-filter'
            });
        } else {
            // Light theme
            currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 20
            });
        }
        
        if (map) {
            currentTileLayer.addTo(map);
        }
    }

    function initializeMap() {
        map = L.map(mapContainer, {
            scrollWheelZoom: false,
            doubleClickZoom: true,
            touchZoom: true,
            boxZoom: true,
            keyboard: true,
        }).setView(center, zoom);

        // Initialize with the appropriate tile layer based on current theme
        updateTileLayer();

        L.control
            .zoom({
                position: "topright",
            })
            .addTo(map);

        if (userPinCode) {
            focusOnUserPinCode();
        }

        if (onLocationSelect) {
            map.on("click", async (e: any) => {
                const { lat, lng } = e.latlng;

                try {
                    const address = await reverseGeocode(lat, lng);
                    onLocationSelect(lat, lng, address || undefined);

                    if (currentLocationMarker) {
                        map.removeLayer(currentLocationMarker);
                    }

                    currentLocationMarker = L.marker([lat, lng])
                        .bindPopup(
                            `<b>Selected Location</b><br>${address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}`,
                        )
                        .addTo(map);
                } catch (error) {
                    console.error("Error getting address:", error);
                    onLocationSelect(lat, lng);
                }
            });
        }

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

                    L.marker([latitude, longitude])
                        .bindPopup("<b>Your Location</b>")
                        .addTo(map);
                },
                (error) => {
                    console.log("Geolocation not available or denied");
                },
            );
        }
    }

    async function geocodePinCode(
        pinCode: string,
    ): Promise<[number, number] | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&postalcode=${pinCode}&limit=1`,
            );
            const data = await response.json();

            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (error) {
            console.error("Error geocoding pin code:", error);
        }
        return null;
    }

    async function reverseGeocode(
        lat: number,
        lng: number,
    ): Promise<string | null> {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            );
            const data = await response.json();

            if (data && data.display_name) {
                return data.display_name;
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
        }
        return null;
    }

    function createCombinedIcon(offerCount: number, requestCount: number) {
        // Create a temporary container to render the MarkerIcon component
        const tempContainer = document.createElement("div");
        const iconComponent = mount(MarkerIcon, {
            target: tempContainer,
            props: {
                offerCount,
                requestCount,
            },
        });

        return L.divIcon({
            className: "custom-marker",
            html: tempContainer.innerHTML,
            iconSize: [32, 32], 
            iconAnchor: [16, 16], 
            popupAnchor: [0, -16], 
        });
    }

    async function updateMarkers() {
        if (!map || !L) return;

        markers.forEach((marker) => map.removeLayer(marker));
        markers = [];

        const postsByPinCode: { [pinCode: string]: Post[] } = {};
        posts.forEach((post) => {
            if (post.pin_code) {
                if (!postsByPinCode[post.pin_code]) {
                    postsByPinCode[post.pin_code] = [];
                }
                postsByPinCode[post.pin_code].push(post);
            }
        });

        for (const [pinCode, postsAtLocation] of Object.entries(
            postsByPinCode,
        )) {
            const coordinates = await geocodePinCode(pinCode);
            if (coordinates) {
                const offerCount = postsAtLocation.filter(
                    (p) => p.post_type === "offer",
                ).length;
                const requestCount = postsAtLocation.filter(
                    (p) => p.post_type === "request",
                ).length;

                const icon = createCombinedIcon(offerCount, requestCount);

                // Create a temporary container to render the Svelte component
                const tempContainer = document.createElement("div");
                const popupComponent = mount(PopupContent, {
                    target: tempContainer,
                    props: {
                        pinCode: pinCode,
                        posts: postsAtLocation,
                    },
                });

                const marker = L.marker(coordinates, { icon })
                    .bindPopup(tempContainer.innerHTML)
                    .addTo(map);

                markers.push(marker);
            }
        }
    }

    $: if (map && posts) {
        updateMarkers();
    }

    export function focusOnPinCode(pinCode: string) {
        if (map && pinCode) {
            geocodePinCode(pinCode).then((coordinates) => {
                if (coordinates) {
                    map.setView(coordinates, 14);

                    const marker = markers.find((m) => {
                        const pos = m.getLatLng();
                        return (
                            Math.abs(pos.lat - coordinates[0]) < 0.001 &&
                            Math.abs(pos.lng - coordinates[1]) < 0.001
                        );
                    });

                    if (marker) {
                        marker.openPopup();
                    }
                }
            });
        }
    }
</script>

<div
    bind:this={mapContainer}
    class="w-full overflow-hidden shadow-md bg-base-100"
    style="height: {height};"
></div>

<style>
    :global(.leaflet-popup-content-wrapper) {
        background: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        padding: 0 !important;
    }

    :global(.leaflet-popup-content) {
        margin: 0 !important;
        line-height: 1 !important;
    }

    :global(.leaflet-popup-tip) {
        display: none !important;
    }

    /* Dark theme map filter - match DaisyUI forest/dark themes */
    :global(.dark-map-filter) {
        filter: sepia(0.2) hue-rotate(90deg) brightness(0.25) contrast(1.3) saturate(0.7) !important;
        mix-blend-mode: multiply !important;
    }

    /* Dim theme map filter - match DaisyUI dim bg-base-100 */
    :global(.dim-map-filter) {
        filter: sepia(0.1) hue-rotate(200deg) brightness(0.4) contrast(1.1) saturate(0.9) !important;
        mix-blend-mode: multiply !important;
    }

    /* Retro theme map filter - warm vintage colors */
    :global(.retro-map-filter) {
        filter: sepia(0.6) hue-rotate(15deg) brightness(0.85) contrast(1.1) saturate(1.2) !important;
        mix-blend-mode: multiply !important;
    }

    /* Valentine theme map filter - romantic pink/red tones */
    :global(.valentine-map-filter) {
        filter: sepia(0.4) hue-rotate(310deg) brightness(0.9) contrast(1.05) saturate(1.3) !important;
        mix-blend-mode: multiply !important;
    }
</style>
