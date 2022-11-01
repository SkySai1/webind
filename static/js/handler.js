function rmi(color, text) {
    $('.right_pannel_message_info').removeClass('hidden')
    clearTimeout(window.vanish);
    $('.right_pannel_message_info').css({'color' : color});
    $('.right_pannel_message_info').text(text);
    window.vanish = setTimeout( function(){
        $('.right_pannel_message_info').addClass('hidden');
    },2000);
    
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
            get_user_list('#userlist-on-ch');
            $('#change-username').val('');
            break;
        case ('nothing_change'):
            rmi('red', 'Необходимо отметить поля для изменения!');
            break;
        case ('userdel_success'):
            rmi('green', 'Пользователь успешно удалён!');
            get_user_list('#userlist-on-ch');
            $('#change-username').val('');
            break;
        /* Реакция на управление серваерми */
        case ('serv_add_success'):
            big_message('green', 'Сервер успешно подключен!', 'Настройте его на стартовом экране');
            break;
        case ('serv_add_permission_bad'):
            big_message('#b99223', 'Ошибка при добавлении сервера, но подключение доступно!','Нет необходимых прав для учетной записи, от имени которой происходит подключение.\nПроверьте, рекурсивно, права на чтение, запись для файла конфиуграции "named.conf" и его директории.\nУзнать месторасположение можно через "named -V".\nИзменить права через "chmod"');
            break;
        case ('serv_exist'):
            big_message('yellow', 'Cервер уже подключен, SSH ключ обновлён','Проверьте ваш список серверов.');
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