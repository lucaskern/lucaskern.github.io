$(document).ready(function () {
  
    $(".navbar-brand").animate({
        top: "+0px"
      }, 500);
  
    $(".work-item").hide();
    $(".Seneca").toggle();
  
    $(".bullet-btn").click(function() {
      $(".bullet-btn").removeClass("selected");
      $(this).addClass("selected");
      
      var title = $(this).attr("title");
      console.log(title);
      
      $(".work-item").hide();
      
      $("."+title).toggle();
    });
});
  
    
