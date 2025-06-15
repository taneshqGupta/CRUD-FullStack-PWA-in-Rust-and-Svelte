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
                    <li>Easily installable as a <strong>PWA (Progressive Web-Application)</strong>.</li>
                    <li><strong>Dynamic + Persistent Theme-Switching</strong> with a multi-theme setup.</li>
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
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 100 100">
                            <path fill="#6e78ac" d="M83.242,60.482c-6.349,1.924-9.957-0.415-9.957-0.415s-0.006,0-0.007,0l-0.394-0.488	c0.131-0.117,0.264-0.242,0.4-0.381l0.019-0.017l-0.001-0.002c5.639-5.753,15.838-29.562,9.749-37.378	c-8.553-10.979-25.66-5.745-25.66-5.745l0.064,0.183c-4.889-1.666-9.947-1.625-13.851,0.838c-0.661,0.417-1.273,0.873-1.844,1.357	l0.014-0.187c0,0-8.149-3.213-15.851-2.383c-7.954,0.857-12.319,6.83-12.319,15.83s6.17,30.553,10.17,34.553s6,2,7,1	c0.896-0.896,6.588-7.387,7.771-8.738c2.143,1.4,4.575,1.743,5.983,1.748c-0.184,0.991-1.31,4.988-7.562,5.714	c-2.809,0.447-1.915,2.298,0.128,2.872c2.002,0.563,8.415,1.967,12.335-3.509c-0.052,3.397-0.183,9.771,0.304,15.126	c0.574,6.319,3.983,8.376,6.511,8.713c7.878,1.048,10.628-4.308,11.394-6.702c0.702-2.194,1.839-10.809,2.213-16.588l0.503-0.089	l-0.004,0.05c8.106,1.277,12.734-1.66,14.362-3.191C86.338,61.12,85.349,59.844,83.242,60.482z"></path><path fill="none" stroke="#1f212b" stroke-miterlimit="10" stroke-width="2" d="M39,58c0,0-6.75,7.562-7.75,8.562s-3,3-7-1	s-10.25-25-10.25-34s4.234-15.518,12.188-16.375C33.89,14.358,42,18,42,18"></path><path fill="none" stroke="#1f212b" stroke-miterlimit="10" stroke-width="2" d="M71.213,56.947	c2.681-2.106,2.968-8.713,2.489-12.734c-0.479-4.021,0.331-6.392,0.235-11.275C70.682,19.629,53.612,10.839,43.75,17.062	s-8.854,20.137-8.375,24.062s-2.444,6.539-0.625,12.188s7.644,6.698,10.037,6.698c2.394,0,4.883,0.957,4.883,3.543	s-0.287,10.34,0.287,16.66c0.574,6.319,3.983,8.376,6.511,8.713c7.878,1.048,10.628-4.309,11.394-6.702s2.052-12.439,2.298-18.096	c0.191-4.404,3.351-4.309,3.351-4.309s3.608,2.339,9.957,0.415c2.106-0.638,3.096,0.638,1.468,2.17	c-1.628,1.532-6.017,4.56-14.124,3.283"></path><path fill="none" stroke="#1f212b" stroke-miterlimit="10" stroke-width="2" d="M74.085,33.617c0,0-6.523-2.242-8.71,2.195	c-1.893,3.841,3.987,18.294,8.199,23.592"></path><path fill="none" stroke="#1f212b" stroke-miterlimit="10" stroke-width="2" d="M34.574,36.617c0,0,7.652-4.612,11.801-1.867	S48.936,48.106,47.149,52c-1.787,3.894-2.362,7.787-2.362,7.787s-0.447,5.106-7.596,5.936c-2.809,0.447-1.915,2.298,0.128,2.872	c2.043,0.574,8.681,2.043,12.574-3.83"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M57.617,15.809	c0,0,17.356-4.174,25.383,5.629c6.553,8.003-4.766,33.882-10.191,38.158"></path><path fill="#1f212b" d="M69.154,38.037c-1.652,0.168-3.423-1.939-0.096-2.346C72.177,35.31,71.323,37.817,69.154,38.037z"></path><path fill="#1f212b" d="M43.223,38.848c-1.824-0.23-3.212-2.945,0.481-2.556C47.165,36.657,45.619,39.151,43.223,38.848z"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M39.492,27.447	c-0.236,0.688-0.451,1.425-0.641,2.213"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M47.808,18.479	c-2.789,0.876-5.771,2.939-7.731,7.456"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M55.064,18.298	c0,0-2.11-0.621-4.851-0.319"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M20.148,21.817	c-1.921,2.074-3.369,5.451-3.173,10.945"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M28.319,18.553	c0,0-3.417-0.258-6.503,1.833"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M53.549,82.6	c0.649,1.702,1.858,3.266,4.1,3.613"></path><path fill="none" stroke="#1f212b" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="M52.83,77.596	c0,0-0.095,1.358,0.186,3.001"></path>
                            </svg>
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