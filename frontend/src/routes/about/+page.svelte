<script>
    // No AOS imports or initialization needed here, as it's done in the layout.
</script>
  
<div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center mb-8">About This Template</h1>
  
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="card bg-base-200 shadow-xl p-6 transition-all duration-500 ease-in-out transform"
             data-aos="fade-up">
            <div class="card-body">
                <h2 class="card-title text-2xl mb-4">Overview</h2>
                <p>This is a starter CRUD template for Rust and SvelteKit.</p>
                <p class="mt-2"><strong>Creation:</strong> 2025</p>
                <p><strong>By:</strong> Taneshq Gupta (CSE Undergrad @ IIT-Mandi)</p>
            </div>
        </div>
  
        <div class="card bg-base-200 shadow-xl p-6 transition-all duration-500 ease-in-out transform"
             data-aos="fade-up" data-aos-delay="150">
            <div class="card-body">
                <h2 class="card-title text-2xl mb-4">Key Features</h2>
                <ul class="list-disc list-inside ml-4 space-y-2">
                    <li>Easily installable as a **PWA (Progressive Web-Application)**.</li>
                    <li>**Dynamic + Persistent Theme-Switching** with a multi-theme setup.</li>
                </ul>
            </div>
        </div>
  
        <div class="card bg-base-200 shadow-xl p-6 md:col-span-2 transition-all duration-500 ease-in-out transform"
             data-aos="fade-up" data-aos-delay="300">
            <div class="card-body">
                <h2 class="card-title text-2xl mb-4">Tech Stack</h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div class="stat">
                        <div class="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="h-8 w-8 inline-block" viewBox="0 0 448 512"><path d="M256 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V64H96c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H352c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H256V32zM128 320c0 17.7 14.3 32 32 32H320c17.7 0 32-14.3 32-32s-14.3-32-32-32H160c-17.7 0-32 14.3-32 32z"/></svg>
                        </div>
                        <div class="stat-title">Backend</div>
                        <div class="stat-value text-2xl">Rust (Axum)</div>
                    </div>
                    <div class="stat">
                        <div class="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="h-8 w-8 inline-block"><path d="M369.9 97.9c-8.9-6.7-21.7-6.4-30.6 .9L257.6 179.9c-6.1 4.7-14.1 6.8-22.1 6.8s-16.1-2.1-22.1-6.8L118.7 98.8c-8.9-6.7-21.7-6.4-30.6 .9S67.5 119 76.4 125.7L167 193c7.2 5.4 17.1 7.7 27 7.7s19.8-2.3 27-7.7L363 125.7c8.9-6.7 9.2-19.5 .9-28.3zM.9 205.7c-8.9-6.7-9.2-19.5-.9-28.3S19 167.5 27.9 174.2l88.3 66.3c6.1 4.7 14.1 6.8 22.1 6.8s16.1-2.1 22.1-6.8l102.7-77.1c8.9-6.7 21.7-6.4 30.6 .9S380.5 200 371.6 206.7L280.9 274c-7.2 5.4-17.1 7.7-27 7.7s-19.8-2.3-27-7.7L85.4 206.7c-8.9-6.7-21.7-6.4-30.6 .9S-8 211.5 .9 205.7zm.9 205.7c-8.9-6.7-9.2-19.5-.9-28.3S19 373.5 27.9 380.2l88.3 66.3c6.1 4.7 14.1 6.8 22.1 6.8s16.1-2.1 22.1-6.8l102.7-77.1c8.9-6.7 21.7-6.4 30.6 .9S380.5 406 371.6 412.7L280.9 480c-7.2 5.4-17.1 7.7-27 7.7s-19.8-2.3-27-7.7L85.4 412.7c-8.9-6.7-21.7-6.4-30.6 .9S-8 411.5 .9 405.7z"/></svg>
                        </div>
                        <div class="stat-title">Frontend</div>
                        <div class="stat-value text-2xl">SvelteKit</div>
                    </div>
                    <div class="stat">
                        <div class="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="h-8 w-8 inline-block" viewBox="0 0 576 512"><path d="M0 128C0 92.7 28.7 64 64 64H512c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM512 416V128H64V416H512zM288 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192zm0-128a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
                        </div>
                        <div class="stat-title">Database</div>
                        <div class="stat-value text-2xl">Postgres</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  
    <div class="text-center mt-12" data-aos="fade-up" data-aos-delay="450">
        <a href="https://github.com/taneshqGupta/rust-svelte-template"
           class="btn btn-soft btn-lg gap-2"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="View Template on GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.923.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View Template on GitHub
        </a>
    </div>
</div>