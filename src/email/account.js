const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SEND_GRID_API_KEY)


const sendWelcomeEmail = (email,name) => {

    sgMail.send({
        to:email,
        from:'anupamkumarrao@gmail.com',
        subject:'Welcome to task app',
        text:`Welcome to the task manager, ${name}.`
    })

}

const sendByeByeEmail = (email,name) => {

    sgMail.send({
        to:email,
        from:'anupamkumarrao@gmail.com',
        subject:'Account deleted on task app',
        text:`You account is deleted, ${name}.`
    })

}

module.exports = {
    sendWelcomeEmail,
    sendByeByeEmail
}
