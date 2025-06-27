(function () {
var iframe = document.createElement('iframe');
iframe.src = 'http://localhost:3000'; 
iframe.style.position = 'fixed';
iframe.style.bottom = '20px';
iframe.style.right = '20px';
iframe.style.width = '380px';
iframe.style.height = '550px';
iframe.style.border = 'none';
iframe.style.zIndex = '9999';
iframe.setAttribute('title', 'Chat Widget');
 
document.body.appendChild(iframe);
})();