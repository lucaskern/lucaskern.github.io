$(window).ready(function () {
  
    $(".bullet-btn").click(function() {
      $(".bullet-btn").removeClass("selected");
      $(this).addClass("selected");
      
      var title = $(this).attr("title");
      console.log(title);
      
      $(".work-item").addClass("hide");
      $('.'+title).removeClass("hide");
    });
});
  
    
