/**
 * Created by Ryan Berg on 6/5/15.
 * rberg2@hotmail.com
 */

var box = document.getElementById('cube');
var email = document.getElementById('email');
var submitButton = document.getElementById('submitButton');
var wasSubmitClicked = false;

//    rollToFront();

$(submitButton).on('mouseenter', function() {
    if(wasSubmitClicked)
    {
        submitButton.innerHTML = 'Resubmit';
    }
});

$(submitButton).on("mouseleave", function()
{
    if(wasSubmitClicked)
    {
        submitButton.innerHTML = 'Done';
    }
});



function rollToTop()
{
    box.style.animation = 'spinningH forwards 1.2s cubic-bezier(.73, .99, .63, 1.2)';
    box.style.webkitAnimation = 'spinningH forwards 1.2s cubic-bezier(.73, .99, .63, 1.2)';
}
function rollToFront()
{
    box.style.animation = 'spinningI forwards 1.2s cubic-bezier(.73, .99, .63, 1.2)';
    box.style.webkitAnimation = 'spinningI forwards 1.2s cubic-bezier(.73, .99, .63, 1.2)';

}



function call()
{
    if($('#email').val().match(/[\s\S]+?@[\s\S]+?\./g))//is valid email
    {
        if(!wasSubmitClicked) {
            wasSubmitClicked = true;


            submitButton.innerHTML = '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Submitting';
//TODO: set timeout

            email.style.border = 'none';

            var xhr = new XMLHttpRequest();

            var name = $('#name').val();
            if (!name) {
                name = '';
            }
            else {
                name = 'name=' + name;
            }

            var details = $('#details').val();
            if (!details) {
                details = '';
            }
            else {
                details = '&details=' + details
            }

            var url = 'http://turingweb.com:3000/mail?' + name + '&email=' + $('#email').val() + details;
            xhr.open("POST", url, true);

            xhr.onload = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        submitButton.innerHTML = 'Done';

                    }
                    else {
                        console.error(xhr.statusText);
                    }
                }
            };

            xhr.onerror = function () {
                console.error(xhr.statusText);
            };
            xhr.send(null);
        }
    }
    else
    {
        email.style.border = '2px solid red';
    }
}