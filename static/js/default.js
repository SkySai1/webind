//import './jquery.min.js';
$(document).ready(function(){
    window.vanish = '';
    var data = {
        status: "server",
        action: "getservlist"
    };
    getservlist(data)
});

function f(){
    $('.square').toggleClass('move-left');

    var elrp = $('.el_right_pannel');
    for (var i = 0; i < elrp.length; i++) {
        if (!$(elrp[i]).hasClass('hidden')) {
            var flag = true;
            break;
        };
    };
    if (flag == true) {
        $('.square2').toggleClass('move-right');
    } else {
        $('.square2').removeClass('move-right');
    };
    document.querySelector('.mainmenu').classList.toggle("hidden");
};
function logout(){
    var dt = {status: 'logout'};
    $.ajax({
        type: 'POST',
        url: '/',
        data: dt,
        dataType: 'html'
      })
      .done(function(data){
        location.reload();
      })
      .fail(function(){
        alert('Внутрення ошибка, перезагрузите страницу!');
        console.log(data);
      })		
};

function cls(el){
    $(el).addClass("hidden");
};

function changer(el){
    $(el).toggleClass("hidden")
}