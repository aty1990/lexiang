require(['$', 'pm'], function ($, PM) {

  let $page = $('.page-mine-group-detail');

  $.httpGet('/wechatUser/getWechatByGroup', PM.stateParam).then(function (users) {
    $page.children('.list').html(users.map(function (user) {
      return getGroupUserTpl(user);
    }).join(''));
  });

  function getGroupUserTpl (user) {
    return `
        <div class="item">
          <div class="item-hd">
            <img src="${user.headImgUrl}" style="width: 40px; border-radius: 50%;">
          </div>
          <div class="item-bd">${user.nickname}</div>
          <div class="item-ft"></div>
        </div>
    `;
  }

});