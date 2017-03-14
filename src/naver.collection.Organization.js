/**
 * @param {string} sApiUrl 조직도 API 주소
 * @constructor
 */
naver.collection.Organization = function (sApiUrl) {
    this._sApiUrl = sApiUrl;
    this._requestOrganizations();
};

naver.collection.Organization.prototype = {

    _requestOrganizations : function () {
        $.ajax({
            url : this._sApiUrl,
            async : false
        }).then(function (aListData) {
            console.log(aListData);
        });
    }
};