 
$(document).ready(function() {
  $('.buttonDiv button').on('click', function(){
    $(this).addClass('active').siblings().removeClass('active');
    $('.all,.my,.live,#split_form').hide();
    $('#dropzone-form,.edit-form,.'+$(this).attr('id')).show();
    if ($(this).attr('id') === "live") {
      $('#split_form').show();
    } else if ($(this).attr('id') === "requests") {
      $('#dropzone-form,.edit-form,#audio_list').hide();

    }

  });

  var shift = false;
  function check_song(el) {
    //console.log(el);
    var checkbox = $(el).find('input.check'),
        checked = false;
    
    if (checkbox.is(':checked')) {
      checkbox.prop('checked',false);
      checked = false;
    } else {
      checkbox.prop('checked',true);
      checked = true;
    }

  }
  var last_clicked = "";
  $('.song').on('click', function(evt) {
    last_clicked = $(this).attr('id');
    if(evt.shiftKey) {
      shift = true;
    } else {
      shift = false;
    }
    check_song(this);
  });
  $('input[type=checkbox]').on('click',function(){
    if ($(this).is(':checked')) {
      $(this).prop('checked',false);
    } else {
      $(this).prop('checked',true);
    }
  });

  $('.edit-form input[type=button]').on('click', function() {
    var which = $(this).attr('id');
    
    if (which === "split_button") {
      return;
    }
    var all_selected = "";
    $('.song').each(function() {
      if($(this).find("input.check").is(':checked')) {
        if (all_selected !== "" && which === "split_button") {
          return;
        }
        all_selected += (",,"+$(this).find("input[type=hidden]").val());
      }
    });
    
    
    if (all_selected !== "") {
      if (which === "delete_button") {
        $('#delete_selected_val').val(all_selected);
        $('#delete_selected').click();  
      } else if (which === "compress_button") {
        $('#compress_selected_val').val(all_selected);
        $('#compress_selected').click();
      } else if (which === "split_button") {
        //$('#split_selected_val').val(all_selected);
        //$('#split_selected').click();
      }
      
    }
  });

  function format_json(artist,album,title,num) {
    var json = "";
    if (artist === "") {
      json += ("artist:"+title+",,"+num+";");
    }
    if (album === "") {
      json += ("album:"+title+",,"+artist+",,"+num+";");
    }
    return json;
  }

  $('#split_button').on('click',function() {
    var checked = 0, link = "", artist = "";
    $('#split_dialog textarea').val("");
    $('#darkened_back').show();
    $('#split_dialog').show();  
    
  });

  function format_split(song) {
    
    var dash = " - ";
    var data = song.split(" ");
    var firstSpace = true;
    var out = (data[0]+dash+song.substr(data[0].length+1,song.length-1));
    out += "\n";
    return out;
  }

  $('#split_accept').on('click',function(){
    var playlist = $('#split_dialog textarea').val();
    var formatted_data = "";
    if (playlist !== "") {
      playlist = playlist.split("\n");
      for (var i = 0; i < playlist.length; ++i) {
        formatted_data += format_split(playlist[i]);
      }
      $('#split_dialog textarea').val(formatted_data);
      $('#split_submit').click();
    }
  });

  $('#split_cancel').on('click',function(){
    $('#split_dialog').hide();
    $('#darkened_back').hide();
  });

  $('#edit_button').on('click', function() {

    
    $('#edit_dialog span').remove();
    $('#edit_dialog .body').remove();
    var html = "", link = "", checked = 0, num = 0;
    var all_links = "", all_nums = "";
    var empty_inputs = "";
    $('.song').each(function() {
      if($(this).find("input.check").is(':checked')) {
        link = $(this).find("input[type=hidden]").val();
        num = $(this).attr('id');
        var artist = $(this).find("td.artist").text();
        var album = $(this).find("td.album").text();
        var title = $(this).find("td.title").text();
        empty_inputs += format_json(artist,album,title,num);
        html += ["<span>Link: "+link+"</span>",
                  "<div class='body'>Name: <input type=text name='title_"+num+"' value=\""+title+"\"/>",
                  "Artist: <input type=text name='artist_"+num+"' value=\""+artist+"\"/>",
                  "Album: <input type=text name='album_"+num+"' value=\""+album+"\"/>",
                  "<input type=hidden name='link_"+num+"' value=\""+link+"\" /></div>"
                ].join("");
        if (all_links === "") {
          all_links += (link);  
        } else {
          all_links += (',,'+link);
        }

        if (all_nums === "") {
          all_nums += (num);  
        } else {
          all_nums += (',,'+num);
        }
      }
    });
    console.log(encodeURI(empty_inputs));
    $.getJSON($SCRIPT_ROOT + '/edit/json', {

      data: empty_inputs
    }, function(data) {
      all_data = data.result.split(",,");
      var num = 0, query = "", result = "";
      for (var i = 0; i < all_data.length-1; ++i) {
        num = all_data[i].split("&")[0];
        query = all_data[i].split("&")[1];
        result = all_data[i].split("&")[2];
        //console.log(query+"_"+num+"_"+result);
        $("input[name="+query+"_"+num+"]").val(result);
      }
      //console.log(data.result);
    });
    $('#links_checked').val(all_links);
    $('#nums_checked').val(all_nums);
    $('#edit_dialog').prepend(html);
    $('#darkened_back').show();
    $('#edit_dialog').show();
  });
  
  $('#edit_cancel_button').on('click',function() {
    $('#edit_dialog').hide();
    $('#darkened_back').hide();
  });
  
  function get_sort_data(el) {
    //console.log(el.getElementsByClassName("time"));
    //console.log(el.getElementsByClassName("time")[0].innerHTML);
    
    var title = el.getElementsByClassName("title")[0].innerHTML;
    

    var time = el.getElementsByClassName("time")[0].innerHTML.split(":");
    
    var artist = el.getElementsByClassName("artist")[0].innerHTML;
    var album = el.getElementsByClassName("album")[0].innerHTML;
    if (album.split(" ")[0] === "The") {
      album = album.substr(4,album.length-1);
    }
  
    return [title,time[0]*60+time[1],artist,album]
    
  }

  function sort_helper(which_sort,currently_sorted) {
    var array = $(".song");

    if (currently_sorted === 0){
      currently_sorted = 1;
      array.sort(function(a,b) {
        var aData = get_sort_data(a);
        var bData = get_sort_data(b);

        //var aTitle = a.querySelectorAll("td.title");
        //var bTitle = b.querySelectorAll("td.title");

        if (aData[which_sort] < bData[which_sort]){
          return -1;
        } else if (aData[which_sort] > bData[which_sort]) {
          return 1;
        } else{
          if (aData[3] < bData[3]) {
            return -1;
          } else {
            return 1;
          }
        }
      });
    }else{
      currently_sorted = 0;
      array.sort(function(a,b) {
        var aData = get_sort_data(a);
        var bData = get_sort_data(b);
      
        if (aData[which_sort] > bData[which_sort]){
          return -1;
        }else if (aData[which_sort] < bData[which_sort]){
          return 1;
        } else{
          if (bData[3] < aData[3]) {
            return -1;
          } else {
            return 1;
          }
        } 
     });
    }
    $(array).remove();
    $("#audio_list").append($(array));
    $('.song').on('click',function(){
      check_song(this);
    });
    
  }
  sort_helper(2,0);

  var curr_num = 0;
  function click_song(el) {
    var span = $(el).find('span');
    var num = parseInt($(el).attr('id'));
    if (num === -1) { return; }

    if (curr_num !== num) {
      $('#audio_list th:nth-child('+(curr_num+2)+') span').remove();  
    }
    
    if (span.length) {
      if (span.hasClass('down')) {
        sort_helper(num,1);
        span.removeClass('down').addClass('up');
      } else {
        sort_helper(num,0);
        span.removeClass('up').addClass('down');
      }
    } else {
      sort_helper(num,0);
      $(el).append("<span class='chevron down'></span>"); 
    }
    curr_num = num;
  }
  $('#audio_list th').on('click', function() {
    click_song(this);
  });
  $('input[type=checkbox]').on('click',function(){
    if ($(this).is(':checked')) {
      $(this).prop('checked',false);
    } else {
      $(this).prop('checked',true);
    }
  });
});




/*
$('#dropzone-form').on('success', function() {
  var args = Array.prototype.slice.call(arguments);
  console.log(args);
});*/
