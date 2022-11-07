$(document).ready(function(){
    window.vanish = '';
    var data = {
        status: "server",
        action: "getservlist"
    };
    getservlist(data)
});
function list_filter(input, list) {
    $(input).on('keyup', function() {
      var filter = $(this).val().toLowerCase();
      $('option').each(function() {
        var text = $(this).text().toLowerCase();
        //if ($(this).text().includes(filter)) {
        if (text.includes(filter)){
            $(this).show();
        } else {
          $(this).hide();
        }
        $(list).val(filter);
      })
    })
  };