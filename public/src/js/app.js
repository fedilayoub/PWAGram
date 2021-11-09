var deferredPrompt;
// if statement is used to check if the browser supports using service worker 
if ('serviceWorker' in navigator){
    // this will tell the browser that the sw.js fike should be treated in a
    //special way as a service worker and be registered in the background
    navigator.serviceWorker
    .register('/sw.js') /* register() returns a promise that means that the operation will take some time,the register methode also can take 
     a second argument which gonna define the scope of your service worker (a js object like:{scope: '/help/'})*/
    // the callback function passed to then() will be executed once the registration is done
    .then(function() {
        console.log('service worker registered');
    });

}
/* to prevent the browser from showing the install app banner automatically*/
window.addEventListener('beforeinstallprompt',function(event){
    console.log('beforeinstallprompt fired')
    event.preventDefault();
    deferredPrompt = event ; 
    return false;
})