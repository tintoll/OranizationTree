/**
 * @param {string} sApiUrl 조직도 API 주소
 * @constructor
 */
naver.collection.Organization = function (sApiUrl) {
    this._sApiUrl = sApiUrl;
    this._aComposite = [];
    this._requestOrganizations();
};

naver.collection.Organization.prototype = {

    /**
     * 최상위 회사 조직 ID
     */
    COMPANY_NODE : 0,

    /**
     * 최상위 조직 미지정 ID
     */
    UNSPECIFIED_NODE : 1,


    /**
     * 조직 리스트를 객체화 한다
     * @param aListData
     * @returns {Array}
     * @private
     */
    _createOrganizations: function (aListData) {
        var aOrganizations = [];

        _.each(aListData, function (htDataSet) {
            aOrganizations.push(new naver.model.Organization(htDataSet));
        });
        return aOrganizations;
    },
    /**
     * 조직 리스트를 트리 구조로 조합한다
     * @param aOrganizations
     * @private
     */
    _composeOrganizations: function (aOrganizations) {
        var oParent = null,
            oSelf = this;
        _.each(aOrganizations, function (oOrganization) {
            if (oOrganization.isRoot()) {
                oSelf._aComposite.push(oOrganization);
            } else {
                oParent = _.findWhere(aOrganizations, {nId: oOrganization.nParentId});
                oParent.appendChild(oOrganization);
            }
        });
    },
    _requestOrganizations : function () {
        $.ajax({
            url : this._sApiUrl,
            async : false
        }).then($.proxy(this._createOrganizations, this))
        .then($.proxy(this._composeOrganizations, this));

    },

    /**
     * 조직을 처음부터 마지막까지 순회한다.
     * @param fnCallback
     */
    each : function (fnCallback) {
        var oSelf = this;

        _.each(this._aComposite, function (oOrganization) {
            oSelf._traverse(oOrganization, undefined, fnCallback);
        })
    },

    /**
     * 전달 받은 조직의 하위 조직을 재귀적으로 순회한다
     * @param oOrganization
     * @param fnCallback
     * @private
     */
    _traverse : function (oOrganization, nTargetId, fnCallback) {
        var aChildren = oOrganization.getChildren(),
            oResult = null,
            oSelf = this;

        if(typeof fnCallback === 'function'){fnCallback(oOrganization);}
        if(oOrganization.nId === nTargetId){return oOrganization;}

        _.every(aChildren, function (oChild) {
            oResult = oSelf._traverse(oChild, nTargetId, fnCallback);
            return !oResult;
        });
        return oResult;
    },
    /**
     * ID값과 같은 조직을 찾아서 반환한다
     * @param nTargetId
     */
    find : function (nTargetId) {
        var oSelf = this,
            oResult = null;
        _.every(this._aComposite, function (oOrganization) {
            oResult = oSelf._traverse(oOrganization, nTargetId);
            return !oResult;
        });
        return oResult;
    },
    /**
     * 지정한 조직의 새로운 하위 조직을 생성한다.
     * @param nId
     * @returns {*}
     */

    create : function (nId) {
        var oSelf = this;

        return $.ajax({
            url : this._sApiUrl+'/'+nId,
            type : 'POST'
        }).then(function (htDataSet) {
            var oOrganization = new naver.model.Organization(htDataSet),
                oParent = oSelf.find(oOrganization.nParentId);
            oParent.appendChild(oOrganization);
            return oOrganization
        });
    },

    /**
     * 조직의 이름을 변경합니다
     * @param nId
     * @param sName
     */
    rename : function (nId, sName) {
        var oSelf = this;

        return $.ajax({
            url : this._sApiUrl+'/'+nId+'?name='+sName,
            type : 'PUT'
        }).then(function (htDataSet) {
            var oOrganization = oSelf.find(htDataSet.id);
            oOrganization.sName = htDataSet.name;

            return oOrganization;
        });
    },

    remove : function (nId) {
        var oSelf = this;

        return $.ajax({
            url : this._sApiUrl+'/'+nId,
            type : 'DELETE'
        }).then(function (htRemoved) {
           var oOrganization = oSelf.find(htRemoved.id),
               oParent = oSelf.find(oOrganization.nParentId);

            oParent.removeChild(oOrganization);
        });
    }
};