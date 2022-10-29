$(document).ready(function(){
    window.vanish = '';
    var data = {
        status: "server",
        action: "getservlist"
    };
    getservlist(data)
});