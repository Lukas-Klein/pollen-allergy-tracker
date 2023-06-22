import sgMail from '@sendgrid/mail';
import { PUBLIC_SENDGRID_APIKEY } from '$env/static/public';
sgMail.setApiKey(PUBLIC_SENDGRID_APIKEY);

export async function load(page){
    const msg = {
        to: "lukasklein1604@outlook.de",
        from: {
            email: "lukasklein1604@outlook.de",
            name: "Pollen Tracker"},
        subject: "Pollen Tracker - Noch keine Daten hochgeladen!",
        text: "Es wurden noch keine Daten hochgeladen!",
        html: "<strong>Es wurden noch keine Daten hochgeladen!</strong>",
    }
    try{
        const output = await sgMail.send(msg);
        console.log("output: ", output);
    }
    catch(err){
        console.log("err: ", err);
    }
}