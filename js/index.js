$(document).ready(function () {
  console.log("index.js ran");

  $("#web, #software, #fun").hide();

  $(".webBtn").click(function () {

    $("#software, #fun").slideUp("slow");

    $("#web").slideToggle("slow");
  });

  $(".funBtn").click(function () {

    $("#web, #software").slideUp("slow");

    $("#fun").slideToggle("slow");
  });

  $(".softwareBtn").click(function () {

    $("#web, #fun").slideUp("slow");

    $("#software").slideToggle("slow");
  });

  $(function () {
    $("#tabs").tabs();
  });

  $(window).scroll(function () {
    //console.log($(window).scrollTop())
    if ($(window).scrollTop() > 280) {
      $('.nav').addClass('navbar-fixed');
      $('.menu').addClass('menu-out');
      
    }
    if ($(window).scrollTop() < 281) {
      $('.nav').removeClass('navbar-fixed');
      $('.menu').removeClass('menu-out');
    }
  });
});
