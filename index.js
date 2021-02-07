require('dotenv').config();
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fs = require('fs');

const storeData = (data, path) => {
  try {
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    console.error(err);
  }
};

const loadData = (path) => {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return false;
  }
};

const msg = {
  to: ['cintia.reichel.12@alumni.ucl.ac.uk', 'smig88@gmail.com'],
  from: 'stefan@mitrasinovic.co.uk',
  subject: 'New dog: ',
  text: 'New dog: ',
  html: '<p>New dog:</p>',
};

const getPostTitles = async () => {
  const oldDogs = loadData(path.join(__dirname, 'dogs.json'));
  try {
    const { data } = await axios.get(
      'https://www.manytearsrescue.org/dogslookingforhomes.php'
    );
    const $ = cheerio.load(data);
    const dogs = [];

    $('#the_table div#container table:nth-child(even) tr:nth-child(2)').each(
      (_, el) => {
        const postTitle = $(el).text().replace('Name: ', '').trim();
        dogs.push(postTitle.trim());
      }
    );
    if (oldDogs) {
      if (oldDogs[0] !== dogs[0]) {
        console.log(`New dog: ${dogs[0]}`);
        const text = `New dog: ${dogs[0]}`;
        msg.subject = text;
        msg.text = text;
        msg.html = $('#the_table div#container').first().html();

        try {
          await sgMail.send(msg);
        } catch (error) {
          console.error(error);
          if (error.response) {
            console.error(error.response.body);
          }
        }
      }
    }
    storeData(dogs, 'dogs.json');

    return dogs;
  } catch (error) {
    throw error;
  }
};

getPostTitles().then((dogs) => console.log(dogs));

