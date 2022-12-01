function f(){

    var elrp = $('.el_right_pannel');
    for (var i = 0; i < elrp.length; i++) {
        if (!$(elrp[i]).hasClass('hidden')) {
            var flag = true;
            break;
        };
    };
    if (flag == true) {
        if ($('.right_pannel').hasClass("hidden")) {
            $('.right_pannel').removeClass("hidden");
            $('.square2').addClass('move-right');
            setTimeout(function(){
                $('.right_pannel').addClass("right_pannel_move");
            },1);
        } else {
            $('.square2').removeClass('move-right');
            $('.right_pannel').removeClass("right_pannel_move")
            setTimeout(function(){
                $('.right_pannel').addClass("hidden");
            },200);
        };

    };
    if ($('.mainmenu').hasClass("hidden")){
        $('.square').addClass('move-left');
        $('.mainmenu').removeClass("hidden");
        clearTimeout(window.vanish);
        window.vanish = setTimeout(function(){
            $('.mainmenu').addClass("mainmenu_show")
            $('.left_pannel').addClass("left_pannel_move");
        },10);
    } else {
        $('.square').removeClass('move-left');
        $('.left_pannel').removeClass("left_pannel_move");
        $('.mainmenu').removeClass("mainmenu_show")
        clearTimeout(window.vanish);
        window.vanish = setTimeout(function(){
            $('.mainmenu').addClass("hidden");
        },200);
    }
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

function rightshow(id){
    $('.right_pannel_message_info').addClass('hidden');
        $('.right_pannel').removeClass('hidden');
    if ($('.right_pannel').hasClass("right_pannel_move")){
        delay=300;
    } else {delay=20;};
    $('.right_pannel').removeClass("right_pannel_move");
    clearTimeout(window.vanish);
    window.vanish = setTimeout(function(){
        $('.right_pannel').addClass("right_pannel_move");
        $('.el_right_pannel').addClass('hidden');
        $('.square2').addClass('move-right');
        //alert(id)
        $(id).removeClass('hidden');
    },delay);
};
function rightclose(){
    $('.right_pannel').addClass('hidden');
    $('.el_right_pannel').addClass('hidden');
    $('.square2').removeClass('move-right');
    $('.right_pannel').removeClass("right_pannel_move");
};

function whatIsIt(object) {
    var stringConstructor = "txt".constructor;
    var arrayConstructor = [].constructor;
    var objectConstructor = ({}).constructor;
    if (object === null) {
        return "null";
    }
    if (object === undefined) {
        return "undefined";
    }
    if (object.constructor === stringConstructor) {
        return "String";
    }
    if (object.constructor === arrayConstructor) {
        return "Array";
    }
    if (object.constructor === objectConstructor) {
        return "Object";
    }
    {
        return "don't know";
    }
}
function dynamicheight(object) {
    object.style.height = 0;
    object.style.height = (object.scrollHeight) + "px";
  };