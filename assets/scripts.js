/* navbar opacity management */
window.addEventListener('scroll', function(e) {
  if (window.scrollY > 100) {
    document.getElementsByTagName("nav")[0].classList.add("solid");
  } else {
    document.getElementsByTagName("nav")[0].classList.remove("solid");
  }
});

/* hamburger status management: opened or closed */
document.getElementById('hamburger').addEventListener('click', function () {
  const classList = document.getElementsByTagName("nav")[0].classList;
  if (classList.contains('active')) {
    classList.remove('active');
  } else {
    classList.add('active');
  }
});

/* on sumit subscribe form */
const subscribe = document.getElementById('subscribe');
if (subscribe) {
  subscribe.onsubmit= () => {
    window.open('https://feedburner.google.com/fb/a/mailverify?uri=Developerro', 'popupwindow', 'scrollbars=yes,width=550,height=520');
    return true;
  };
}

/* post external links in new tab */
document.querySelectorAll('.post a').forEach(link => {
  if (link.hostname != window.location.hostname) {
    link.target = '_blank';
  }
});

/* theme switcher */
const li = document.createElement('li');
if (localStorage.getItem('dark-theme') == 'dark-theme') {
  li.innerHTML = `<a style="cursor: pointer"><i id="theme-switch" class="fas fa-toggle-on"></i></a>`;
  document.body.classList.add('dark-theme');
} else {
  li.innerHTML = `<a style="cursor: pointer"><i id="theme-switch" class="fas fa-toggle-off"></i></a>`;
}
document.getElementById('nav-options').appendChild(li);

document.getElementById('theme-switch').addEventListener("click", (e) => {
  const a = document.getElementById('theme-switch');
  const darkEnabled = localStorage.getItem('dark-theme') != 'dark-theme';
  localStorage.setItem('dark-theme', darkEnabled ? 'dark-theme' : '');
  if (darkEnabled) {
    a.classList.add('fa-toggle-on');
    a.classList.remove('fa-toggle-off');
    document.body.classList.add('dark-theme');
  } else {
    a.classList.add('fa-toggle-off');
    a.classList.remove('fa-toggle-on');
    document.body.classList.remove('dark-theme');
  }
});

/* cookie consent and google analytics */
function createCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}

if(readCookie('cookie-notice-dismissed')=='true') {
  activateGoogleAnalytics();
} else {
  document.getElementById('cookie-notice').style.display = 'block';
}

document.getElementById('cookie-notice-accept').addEventListener("click",function() {
  createCookie('cookie-notice-dismissed','true',180);
  document.getElementById('cookie-notice').style.display = 'none';
  location.reload();
});