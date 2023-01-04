function setSerial(){
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + mm + dd+'01'
    $('#zoneSerial').val(today)
    rightshow('#new-zone')
}

function get_zones_list(skip){
    var command ={
        'status': 'zone',
        'action': 'getzones'
    };
    get_object_list(skip, command);
}


function makeZones(){
    closeobject('zones')
    // -- Выводим полученный список Зон --
    let saved = sessionStorage.getItem('objectData');
    var zones = JSON.parse(saved);
    //

    let mainBlock = document.getElementById('zonesMain'); //Получаем блок с осн. таблицей
    mainBlock.textContent='';
    //Создаём заголовок
    header=['ID', 
            'Доменное имя', 
            'type',
            'Expire', 
            'Refresh',
            'Retry',
            'TTL'
    ];
    // -- Создадим поля ввода
        let form = document.createElement('form'); //Создадим форму
        form.id='buffForm'
    // -- Создадим массив полей --
    id = []
    fqdn = []
    type = []
    expire = []
    refresh = []
    retry = []
    ttl = []
    action = []

    for (let key in zones){
        id.push(key);
        fqdn.push(zones[key]['info']['zonename'])
        type.push(zones[key]['info']['type'])
        expire.push(zones[key]['info']['expire'])
        refresh.push(zones[key]['info']['refresh'])
        retry.push(zones[key]['info']['retry'])
        ttl.push(zones[key]['info']['ttl'])

        // --Создадим кнопку раскрытия
        let button = imgButton('img-up', '24px');
        button.onclick=function(){showZone(key, zones);};
        //

        action.push(button)

    }
    fields = [id, fqdn, type, expire, refresh, retry, ttl, action];
    //

    mainTable = makeTable(header, fields);
    mainTable.classList.add('mainTable');
    mainTable.id='zoneTable'
    mainBlock.appendChild(mainTable);
    mainBlock.appendChild(form);
}

function showZone(id, json){
    front = expandDetail('zones', id, json[id]['info']['zonename'], '')
}