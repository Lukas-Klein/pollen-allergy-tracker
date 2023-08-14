import { PUBLIC_SENDGRID_APIKEY } from '$env/static/public'
import sgMail from '@sendgrid/mail'
import { json } from '@sveltejs/kit';

sgMail.setApiKey(PUBLIC_SENDGRID_APIKEY)

export const GET = async () => {
    const allPosts = await sendMail();
    return json(allPosts);	
  };

async function sendMail(){
const msg = {
  to: "lukasklein1604@outlook.de",
  from: "lukasklein1604@outlook.de",
  subject: 'Pollentracker - Noch keine Dateien hochgeladen!',
  text: 'and easy to do anywhere, even with Node.js 123',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
    return {msg: 'Email sent'}
  })
  .catch((error) => {
    console.error(error)
    return {msg: error}
  })}