<div class='wrapper'>
    <div id='left-defaults' class='container'>
        <div class="nav">
            <ul id="menu" class="menu trigger lefted">
                <li>
                    <div>Home</div>
                </li>
                <li>
                    <div>Profile</div>
                </li>
                <li>
                    <div>Blog</div>
                </li>
                <li>
                    <div>Demos</div>
                </li>
                <li>
                    <div>Code</div>
                </li>
                <li>
                    <div class="g-plusone" data-size="small" data-annotation="inline" data-width="200"></div>
                </li>
                <li>
                    <div><a href="https://twitter.com/share" class="twitter-share-button" data-via="Leviathanian" data-hashtags="ShaheedAbdol">Tweet</a></div>
                </li>
            </ul>
            <button class="popup lefted">MENU</button>
            <button class="popup-right">
                <div class="arrow right"></div>
            </button>
        </div>
    </div>
    <div id='right-defaults' class='container'>
        <button class="popup-left">
            <div class="arrow left"></div>
        </button>
    </div>
</div>

<script type='text/javascript'>
    var button = jQuery('.popup'),
        items = document.querySelectorAll('.trigger'),
        buttonLeft = jQuery('.popup-left'),
        buttonRight = jQuery('.popup-right');
    var openCloseMenu = function () {
        for (i = 0; i < items.length; i++) {
            items[i].classList.toggle('slideout');
        }
    }
    var getMenuLocation = function() {
        if (typeof(Storage) !== "undefined") {
            return localStorage.getItem("menuLocation");
        }
        return "left";
    }
    var storeMenuLocation = function(location) {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("menuLocation", location);
        }
    }
    var moveMenu = function (from, to) {
        jQuery('.trigger').removeClass(from+'ed');
        jQuery('.trigger').addClass(to+'ed')
        jQuery('.popup').removeClass(from+'ed');
        jQuery('.popup').addClass(to+'ed');
        storeMenuLocation(to);
    }

    button.on('click', openCloseMenu);
    buttonLeft.on('click', function() { moveMenu('right', 'left'); });
    buttonRight.on('click', function() { moveMenu('left', 'right'); });

    getMenuLocation() == 'left' ? moveMenu('right', 'left') : moveMenu('left', 'right');

    (function() {
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/platform.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();

    !function(d,s,id){
        var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';
        if (!d.getElementById(id)){
            js=d.createElement(s);
            js.id=id;js.src=p+'://platform.twitter.com/widgets.js';
            fjs.parentNode.insertBefore(js,fjs);
        }
    }(document, 'script', 'twitter-wjs');
</script>
