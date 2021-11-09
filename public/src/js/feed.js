var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  //check if the defferedPrompt is set by the browser then we will prompt it
  if(deferredPrompt){
    deferredPrompt.prompt();
    // the callback fun is executed once the user made a choice (userChoice() is a promise)
    deferredPrompt.userChoice.then(function(choiceResult){
      console.log(choiceResult.outcome); //choiceResult.outcome is a string describiing the choice of the user
      if(choiceResult.outcome === 'dismissed'){ //'dismissed' means that the user clicked the X button
        console.log('user cancelled istallation '); 
      } else{
        console.log('User added to home screen');
      }
    });
    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
