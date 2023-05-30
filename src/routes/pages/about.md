---
dir: pages
title: About me
icon: Envelope
---

<script>
  import { Img, Heading, P } from 'flowbite-svelte'
</script>

<Img  src="/profilePicture.JPEG" alt="sample 1" size="w-96" imgClass="h-80" class="rounded-full" />

<Heading class="p-8" tag="h1" customSize="text-3xl">{title}</Heading>

<P class="px-8 py-4">
Welcome to my personal pollen allergy tracking website! My name is Lukas, and I have been struggling with pollen allergies for as long as I can remember. Pollen has always been my seasonal nemesis, causing me discomfort and impacting my quality of life. This website is dedicated to document and analyze my daily struggles as I deal with this allergy.
</P>
<P class="px-8 py-4">
As a tech-savvy and data-driven individual, I decided to fully code this website myself based on a Template provided by <a href="https://github.com/shinokada/flowbite-sveltekit-responsive-sidebar-layout">Flowbite</a>. With the primary goal of assisting my doctor in honing the most effective and specific immunotherapy treatment for my case, I built this platform using my programming skills and creativity.
</P>
<P class="px-8 py-4">
Every day, I visit the website to report my allergy symptoms, challenges, and struggles. This data is then securely stored in the Supabase backend that I've set up. My doctor has access to this database, enabling them to closely monitor my experiences and use the collected data to shape a tailored approach to my immunotherapy.
</P>
<P class="px-8 py-4">
Feel free to explore my website and learn more about my pollen allergy journey. If you have any questions, suggestions, or simply want to connect and share your own experiences, please don't hesitate to reach out to me via the Contact section.
</P>
