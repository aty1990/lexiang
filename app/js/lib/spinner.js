/**
 * Created by sjin on 17/3/1.
 */
define(['$'], function ($) {
  $.fn['spinner'] = function (options) {
    return spinner(options, $(this));
  };

  var spinner = function (options, $this) {
    $this.wrap('<div class="input"></div>');
    var $inputDiv = $this.parent();

    $inputDiv.wrap('<div class="spinner"></div>');
    var $spinner = $inputDiv.parent();

    $inputDiv.before('<a class="minus"><i class="app-icon"></i></a>');
    var $minus = $spinner.find('.minus');

    $inputDiv.after('<a class="plus"><i class="app-icon"></i></a>');
    var $plus = $spinner.find('.plus');

    var val = options.val ? options.val : 0;

    var step = parseInt(options.step || 1);
    var max = options.max ? parseInt(options.max) : null;
    var min = options.min ? parseInt(options.min) : null;

    /**
     * get  & set
     * @param v
     */
    var setValue = function (v) {
      $this.val(v);
      if (options.onChange) options.onChange(v);
    };
    var getValue = function () {
      return $this.val();
    };

    $plus.on('tap', function () {
      var newVal = parseInt(getValue()) + step;
      if (max || max == 0) {
        if (newVal <= max) {
          setValue(newVal);
        }
      } else {
        setValue(newVal);
      }
      doDisabled(newVal);
    });
    $minus.on('tap', function () {
      var newVal = parseInt(getValue()) - step;
      if (min || min == 0) {
        if (newVal >= min) {
          setValue(newVal);
        }
      } else {
        setValue(newVal);
      }
      doDisabled(newVal);
    });

    $this.on('blur', function () {
      var newVal = parseInt(getValue());
      var isCallback = true;
      if (min || min == 0) {
        if (newVal < min) {
          setValue(val);
          isCallback = false;
        }
      }
      if (max || max == 0) {
        if (newVal > max) {
          setValue(val);
          isCallback = false;
        }
      }
      if (isCallback && options.onChange) {
        options.onChange(newVal);
      }
      this.value = newVal;
      doDisabled(newVal);
    });
    var doDisabled = function (v) {
      v = parseInt(v);
      if (min || min == 0) {
        if ((v - step) < min) {
          $minus.addClass('disabled');
        } else {
          if ($minus.hasClass('disabled')) $minus.removeClass('disabled');
        }
      }
      if (max || max == 0) {
        if ((v + step) > max) {
          $plus.addClass('disabled');
        } else {
          if ($plus.hasClass('disabled')) $plus.removeClass('disabled');
        }
      }
    };

    // init
    setValue(val);
    doDisabled(val);
  }
});