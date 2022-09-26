document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click',  () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#submit-btn').onclick = save_email;
  // By default, load the inbox
  load_mailbox('inbox');
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#single-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  read_email(mailbox);
  
  // Show the mailbox and hide other views
  document.querySelector('#single-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function save_email(){
  
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients:recipients,
      subject:subject,
      body: body
    })
  })
  .then(response => response.json)
  .then(result=>{
    console.log(result)
  })
    
  localStorage.clear();
  load_mailbox('sent');

  return false;
}


function read_email(mailbox){

  fetch('/emails/'+ `${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails)
    if(emails.lenght <=1 ){
      alert('yes')
    }
    // For every email make a separate div with divs inside and display the email info
    emails.forEach(email => {
      //if(email.archived == false){}
      const page = document.querySelector('#emails-view');

      // Wrapper div
      const emailClass = document.createElement('div');
      emailClass.className = 'email-class';
      page.append(emailClass);
      emailClass.addEventListener('click', function(event){
        event.preventDefault();
        email_page(email.id);

      })
      // Timestamp info
      const timestampClass = document.createElement('div');
      timestampClass.className = 'time-class';
      timestampClass.innerText = email.timestamp;
      emailClass.append(timestampClass);


      // Sender info
      const senderClass = document.createElement('div');
      senderClass.className = 'sender-class';
      senderClass.innerText = `Sent by: ${email.sender}`;
      emailClass.append(senderClass);

     

      // Subject info
      const subjectClass = document.createElement('div');
      subjectClass.className = 'subject-class';
      subjectClass.innerText = `Subject: ${email.subject}`;
      emailClass.append(subjectClass);


      if(mailbox !== 'sent' && email.archived == false){
        // Clickable archive button
        const archiveBtn = document.createElement('img')
        archiveBtn.src = 'https://pic.onlinewebfonts.com/svg/img_518930.png';
        archiveBtn.style.width = '30px';
        page.append(archiveBtn);
        archiveBtn.addEventListener('click', function(event){
          event.preventDefault();
          archive_email(email.id);
          //localStorage.clear();
          load_mailbox('archive');
        })
      }
      
      //unarchive button
      if(mailbox == 'archive'){
        const unarchiveBtn = document.createElement('img');
        unarchiveBtn.src = 'https://cdn0.iconfinder.com/data/icons/complete-common-version-3-5/1024/unarchive6-512.png'
        unarchiveBtn.style.width = '30px';
        page.append(unarchiveBtn);
        unarchiveBtn.addEventListener('click', function(event){
          event.preventDefault();
          unarchive_email(email.id)
          //localStorage.clear();
          load_mailbox('inbox');
        })
      }

      if(email.read == true){
        emailClass.style.backgroundColor = 'lightgray';
      }
      

    
    });
  });

}



function email_page(email_id){
  fetch('/emails/'+`${email_id}`,{
    method: 'GET'
  })
  .then(response => response.json())
  .then(email => {
    console.log(email);

    // Reply form
    const page = document.querySelector('#reply-view')
    page.innerHTML = '<button id="reply-btn">Reply</button>'
    document.querySelector('#reply-btn').addEventListener('click', function(event){
      event.preventDefault();
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      if(email.subject.slice(0,2) !== 'Re'){
        document.querySelector('#compose-subject').value = 'Re: ' + `${email.subject}`;
      }else{
        document.querySelector('#compose-subject').value = `${email.subject}`;
      }
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: "${email.body.slice(0,25)}..."\n\n`
    })
    
    //show the email in the separate view
    document.querySelector('#time-view').innerText = `${email.timestamp}`;
    document.querySelector('#sender-view').innerText = `Sent by: ${email.sender}`;
    document.querySelector('#subject-view').innerText = `Subject: ${email.subject}`;
    document.querySelector('#body-view').innerText = `Email: \n${email.body}`;

    // only show the single-view
    document.querySelector('#single-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    mark_email_as_read(email_id)

  })
}




function mark_email_as_read(id){
  fetch('/emails/' + `${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

}


// archive email
function archive_email(id){
  fetch('/emails/' + `${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
}

function unarchive_email(id){
  fetch('/emails/' + `${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
}



