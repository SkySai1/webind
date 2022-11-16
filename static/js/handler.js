function rmi(color, text, form) {
    $('.right_pannel_message_info').removeClass('hidden')
    clearTimeout(window.vanish);
    if (color =='green'){
        $('.right_pannel_message_info').addClass('neonText-green');
        if (form){form.reset();};
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
function big_message(form, color, text, advise) {
    if (color =='green'){
        form.reset();}
    $('.rh_block').removeClass('hidden');
    $('#rh_message').text('');
    $('#rh_info').text('');
    $('#rh_message').css({'color' : color});
    $('#rh_message').text(text);
    $('#rh_info').text(advise);
};
function response_handler(data, form){
    /* Блок реакций функций управления пользвотаелей*/
    switch(data) {
        case ('empty_login'):
            rmi('red', 'Введите псевдоним и пароль!', form);
            break;
        case ('add_sucess'):
            rmi('green', 'Пользователь успешно создан!', form);
            break;
        case ('user_exist'):
            rmi('red', 'Ошибка, пользователь существует!', form);
            break;
        case ('empty_user'):
            rmi('red', 'Выберете пользователя!', form);
            break;
        case ('sa_block'):
            rmi('red', 'Запрещено изменять данные первого суперадмина!', form);
            break;
        case ('bad_username'):
            rmi('red', 'Пользователь не найден!', form)
            break;
        case ('empty_field'):
            rmi('red', 'Заполните все отмеченные поля!', form);
            break;
        case ('change_success'):
            rmi('green', 'Данные пользователя успешно изменены!', form);
            get_user_list('#userlist-on-ch', "#f-userchange", 'skip');
            break;
        case ('nothing_change'):
            rmi('red', 'Необходимо отметить поля для изменения!', form);
            break;
        case ('userdel_success'):
            rmi('green', 'Пользователь успешно удалён!', form);
            get_user_list('#userlist-on-ch', "#f-userchange", 'skip', form);
            break;
        /* Реакция на управление списком серваеров  */
        case ('serv_add_success'):
            big_message(form, 'green', 'Сервер успешно подключен!', 'Настройте его на стартовом экране');
            break;
        case ('serv_permission_bad'):
            big_message(form, '#b99223', 'Ошибка прав на сервере!',
            'Нет необходимых прав для учетной записи, от имени которой происходит подключение.\nПроверьте, рекурсивно, права на чтение, запись для файла конфиуграции "named.conf" и его директории.\nУзнать месторасположение можно через "named -V".\nИзменить права через "chmod"');
            break;
        case ('serv_exist'):
            big_message(form, '#b99223', 'Cервер уже подключен, SSH ключ обновлён','Проверьте ваш список серверов.');
            break;
        case ('sshkey_failure'):
            big_message(form, 'red', 'Ошибка при настройке SSH ключа', 
            'Проверьте настройки SSH сервера на включение pubkey-authentication.\nУбедитесь, что для пользователя существует домашняя директорияю.\nВ случае с RHEL (CentOS) проверьте значения SELinux для домашней директории пользователя. ')
            break;
        case ('connect_failure'):
            big_message(form, 'red', 'Ошибка при подключении к серверу',
            'Проверьте введенные данные.\nУбедитесь, что на сервере работает SSH служба и открыты сетевые доступы.\n')
            break;
        case ('empty_host'):
            rmi('red', 'Выберете сервер!', form);
            break;
        case ('empty_serv_field'):
            rmi('red', 'Заполните все поля!', form);
                break;
        case ('bad_hostname'):
            rmi('red', 'Сервер не найден!', form)
            break;
        case ('servermv_success'):
            big_message(form, 'green', 'Адресс сервера успешно изменен!', 'Изменения на главном экране');
            get_servlistbox('#servlist-on-ch', '#server-mv', 'skip');
            $('#change-username').val('');
            break;
        case ('servdel_success'):
            rmi('green', 'Сервер успешно удалён!', form);
            get_servlistbox('#servlist-on-ch', '#server-mv', 'skip');
            $('#change-username').val('');
            break;
        /* Реакция на управление серверами */
        case ('update_success'):
            updatesuccess();
            console.log('update!')
            break;
        /*Реакция на управление обзорами */
        case ('viewadd_success'):
            rmi('green', 'Обзор успешно добавлен!', form);
            get_views_list(true)
            break;
        case ('viewdelete_success'):
            rmi('green', 'Обзор успешно удалён!');
            get_views_list(true)
            break;
        /* Реакция на управление зонами */
        case ('zone_add_success'):
            rmi('green', 'Зона успешно создана!', form);
            break;
        /* Общие события */
        case ('failure'):
            big_message(form, 'red', 'Ошибка выполнения функции!')
            break;
        case ('bad_role'):
            big_message(form, 'red', 'Ошибка при прямом обращении к роли!')
            break;
        default:
            alert(data);
            break;
    };
};