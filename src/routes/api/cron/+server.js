const { createClient } = require('@supabase/supabase-js');
// @ts-ignore
const {  PUBLIC_SUPABASE_KEY, PUBLIC_EMAIL_PASSWORD } = require('$env/static/public');
const nodemailer = require('nodemailer');


    
    export const config = {
        runtime: 'edge',
      };
    
    // @ts-ignore
    async function handler(req, res) {
      // Get the current date in the needed format
      const current = new Date();
      current.setDate(current.getDate());
    
      // Initialize a Supabase client with your credentials
      const supabaseUrl = 'https://hobixloqfrxsnqlwfqer.supabase.co';
      const supabaseKey = PUBLIC_SUPABASE_KEY;
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Query the database
      const { data, error } = await supabase
        .from('Calendar')
        .select('*')
        .eq(
            'Datum',
            current.getFullYear() +
                '-' +
                ('0' + (current.getMonth() + 1)).slice(-2) +
                '-' +
                ('0' + current.getDate()).slice(-2)
        );
    
      if (error) {
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
    
      if (data.length === 0) {
        const transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'lukasklein1604@outlook.de',
            pass: PUBLIC_EMAIL_PASSWORD
          }
        });
    
        const message = {
          from: 'PollenTracker <lukasklein1604@outlook.de>',
          to: 'lukasklein1604@outlook.de',
          subject: 'No changes today',
          text: 'There have been no changes today',
          html: '<p>There have been no changes today</p>'
        };
    
        transporter.sendMail(message, (error) => {
          if (error) {
            console.log(error);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
          
          res.status(200).json({ message: 'No changes today, email sent' });
        });
        
        return;
      }
      else{
        // If there are results, there has been a change on the current day
        res.status(200).json({ message: `Changes found: ${JSON.stringify(data)}` });
        }
    }
    
    module.exports = handler;