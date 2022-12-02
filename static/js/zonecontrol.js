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
