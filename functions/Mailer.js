const nodemailer =  require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 465,
    auth: {
       user: 'support@solutionwheels.com',
       pass: 'put_your_password_here'
    }
});

transport.use('compile', hbs({
  viewEngine: 'express-handlebars',
  viewPath: '../templates/'
}));

function sendIt(message){
  transport.sendMail(message, function(err, info) {
      if (err) {
        console.log(err)
      } else {
        console.log(info);
      }
  });
}

module.exports = SendMail(type, recievers, data){
  const sender = 'support@solutionwheels.com';
  // reset-password, signup-welcome, notification,
  switch (type) {
    case 'reset-password':
      sendIt({
          from: sender, // Sender address
          to: recievers,        // List of recipients
          subject: 'Solutionwheels Password Reset', // Subject line
          template: 'reset'
      });
      break;
    case 'welcome':
      sendIt({
        from: sender,
        to: recievers,
        subject: 'Welcome to Solutionwheels',
        template: 'welcome'
      });
      break;
    case 'notification':
      sendIt({
        from: sender,
        to: recievers,
        subject: 'Solutionwheels You have a new Notification',
        template: 'notify'
      });
      break;
    default:
      return false;
  }
}
