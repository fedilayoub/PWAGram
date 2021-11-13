var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
  //getting rid service worker
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.getRegistrations().then(function(registrations) {
//     for(let registration of registrations) {
//             registration.unregister()
//     }}).catch(function(err) {
//         console.log('Service Worker registration failed: ', err);
//     });
// }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
/* we can access the cache from front JS too but we need to use another name of cache to make the On Demand caching */
// var onSaveButtonClicked = (event)=>{
//   console.log('clicked');
//   if('caches' in window){
//     caches.open('user-requested').then(cache =>{
//       cache.addAll([
//         'https://httpbin.org/get',
//         '/src/images/sf-boat.jpg'
//       ]);
//     })
//   }
// }
//the code above is used in on demande caching

const clearCards = ()=>{
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'save'
  // cardSaveButton.addEventListener('click',onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton);
  //the code above is used in the on demande cache section
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}
var url = 'https://httpbin.org/get';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    networkDataReceived = true;
    return res.json();
  })
  .then(function(data) {
    console.log('Data from web',data);
    clearCards();
    createCard();
  });

  if('caches' in window){
    caches.open('user-requested').then(cache => {
        caches.match(url)
        .then(response => {
          if(response){
            return response.json();
          }
        })
        .then( data => {
          console.log('Data from cache',data);
          if(!networkDataReceived){
            clearCards();
             createCard();
          }
         
        })
    })
  }


  // JSON data should't be stored in cache
