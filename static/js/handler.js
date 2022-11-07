function rmi(color, text) {
    $('.right_pannel_message_info').removeClass('hidden')
    clearTimeout(window.vanish);
    if (color =='green'){
        $('.right_pannel_message_info').addClass('neonText-green');
    } else if (color == 'red') {
        $('.right_pannel_message_info').addClass('neonText-red');
    }
    $('.right_pannel_message_info').css({'color' : color});
    $('.right_pannel_message_info').text(text);
    window.vanish = setTimeout( function(){
        $('.right_pannel_message_info').addClass('hidden');
        $('.right_pannel_message_info').removeClass('neonText-red');
        $('.right_pannel_message_info').removeClass('neonText-green');
    },5000);
    
};
function big_message(color, text, advise) {
    $('.rh_block').removeClass('hidden');
    $('#rh_message').text('');
    $('#rh_info').text('');
    $('#rh_message').css({'color' : color});
    $('#rh_message').text(text);
    $('#rh_info').text(advise);
};
function responce_handler(data){
    /* Блок реакций функций управления пользвотаелей*/
    switch(data) {
        case ('empty_login'):
            rmi('red', 'Введите псевдоним и пароль!');
            break;
        case ('add_sucess'):
            rmi('green', 'Пользователь успешно создан!');
            break;
        case ('user_exist'):
            rmi('red', 'Ошибка, пользователь существует!');
            break;
        case ('empty_user'):
            rmi('red', 'Выберете пользователя!');
            break;
        case ('sa_block'):
            rmi('red', 'Запрещено изменять данные первого суперадмина!');
            break;
        case ('bad_username'):
            rmi('red', 'Пользователь не найден!')
            break;
        case ('empty_field'):
            rmi('red', 'Заполните все отмеченные поля!');
            break;
        case ('change_success'):
            rmi('green', 'Данные пользователя успешно изменены!');
            get_user_list('#userlist-on-ch', "#f-userchange", 'skip');
            break;
        case ('nothing_change'):
            rmi('red', 'Необходимо отметить поля для изменения!');
            break;
        case ('userdel_success'):
            rmi('green', 'Пользователь успешно удалён!');
            get_user_list('#userlist-on-ch', "#f-userchange", 'skip');
            break;
        /* Реакция на управление списком серваеров  */
        case ('serv_add_success'):
            big_message('green', 'Сервер успешно подключен!', 'Настройте его на стартовом экране');
            break;
        case ('serv_add_permission_bad'):
            big_message('#b99223', 'Ошибка при добавлении сервера, но подключение доступно!','Нет необходимых прав для учетной записи, от имени которой происходит подключение.\nПроверьте, рекурсивно, права на чтение, запись для файла конфиуграции "named.conf" и его директории.\nУзнать месторасположение можно через "named -V".\nИзменить права через "chmod"');
            break;
        case ('serv_exist'):
            big_message('yellow', 'Cервер уже подключен, SSH ключ обновлён','Проверьте ваш список серверов.');
            break;
        case ('empty_host'):
            rmi('red', 'Выберете сервер!');
            break;
        case ('empty_serv_field'):
            rmi('red', 'Заполните все поля для изменения!');
                break;
        case ('bad_hostname'):
            rmi('red', 'Сервер не найден!')
            break;
        case ('servermv_success'):
            rmi('green', 'Адресс сервера успешно изменен!');
            get_servlistbox('#servlist-on-ch', '#server-mv', 'skip');
            $('#change-username').val('');
            break;
        case ('servdel_success'):
            rmi('green', 'Сервер успешно удалён!');
            get_servlistbox('#servlist-on-ch', '#server-mv', 'skip');
            $('#change-username').val('');
            break;
        /* Общие события */
        case ('failure'):
            big_message('red', 'Ошибка выполнения функции!')
            break;
        case ('bad_role'):
            big_message('red', 'Ошибка при прямом обращении к роли!')
            break;
        default:
            alert(data);
            break;
    };
};