require.config({
    baseUrl: '../js',
    paths: {
        jquery: 'jquery-2.1.3',
        'jquery.data2page': '../js/jquery.data2page'
    }
});

require(['jquery', 'jquery.data2page'], function($) {

    var userInfo = {

        hidden: 'foidwrd4iy',
        account: 12345,
        password: 'admin',
        name: 'wanjl',
        gender: 'female', // 这也很有可以要配置, 比如1 -> 男, 2 -> 女
        sports: 'a-b-c',
        age: '1',
        flower: "1,2,3,4",
        desc: 'ipanel'

    };

    $(function() {

        $('form').data2page(userInfo, {
            shim: [{
                sports: {
                    separator: '-'
                }
            }, {
                flower: {
                    separator: ','
                }
            }]
        }).css('color', 'red').css('background-color', '#ccc').on('submit', function(e) {
            e.preventDefault();

            alert(this.action);
        });

    });

});
