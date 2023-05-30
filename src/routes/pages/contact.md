---
dir: pages
title: Contact
icon: ChatBubbleOvalLeftEllipsis
---

<script>
  import { Img, Heading, P, Label, Input, Button, Textarea} from 'flowbite-svelte'
</script>

<Heading class="p-8" tag="h1" customSize="text-3xl">{title}</Heading>

<P class="px-8 py-4">I'd love to hear from you! Whether you're a fellow allergy warrior, interested in the programming side of this project, or simply have some words of encouragement - don't hesitate to get in touch.</P>

<P class="px-8 py-4">Here's how you can reach me:</P>
<form class="px-8">
  <div class="contactGrid">
    <div>
      <Label for="first_name" >First name</Label>
      <Input type="text" id="first_name" placeholder="Your Starbucks misspelled label" required  />
    </div>
    <div>
      <Label for="last_name" >Last name</Label>
      <Input type="text" id="last_name" placeholder="Your family reunion name tag" required />
    </div>
  </div>
  <div class="contactColumn">
    <Label for="email" >Email address</Label>
    <Input type="email" id="email" placeholder="sendmememes@example.com" required />
  </div>
  <div class="contactColumn">
  <Label for="textarea" >Your message</Label>
  <Textarea id="textarea" placeholder="Type your burning question or delightful anecdote here..." rows="4" name="message"/>
  </div>
  <Button type="submit">Submit</Button>
</form>
