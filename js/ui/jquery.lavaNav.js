(function($) {
    $.fn.lavaNav = function(options) {
        
        options = $.extend({
            overlap: 20,
            speed: 500,
            reset: 500,
            color: '#0b2b61',
            easing: 'easeOutExpo'
        }, options);

        return this.each(function() {

            var nav = $(this);
            var currentPageItem = $('#selected', nav);
            var lava;
            var reset;

            $('<li id="lava"></li>').css({
                width: currentPageItem.outerWidth(),
                height: currentPageItem.outerHeight() + options.overlap,
                
                top: currentPageItem.position().top - options.overlap/2,
                left: currentPageItem.position().left,
                backgroundColor: options.color
            }).appendTo('#nav');

            lava = $('#lava', nav);

            $('li:not(#lava)', nav).hover(function() {
                clearTimeout(reset);
                lava.animate(
                    {
                        left: $(this).position().left,
                        width: $(this).width()
                    },
                    {
                        duration: options.speed,
                        easing: options.easing,
                        queue: false
                    }
                );
            }, function() {
                
                lava.stop().animate({
                    left: $(this).position().left,
                    width: $(this).width()
                }, options.speed);
                
                reset = setTimeout(function() {
                    lava.animate({
                        left: currentPageItem.position().left,
                        width: currentPageItem.outerWidth()
                    }, options.speed);
                }, options.reset);
            });


        });
    };
})(jQuery);