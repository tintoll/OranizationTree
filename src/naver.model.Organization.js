/**
 * @typedef {Object} OrganizationDataset
 * @property {number} id 조직의 ID
 * @property {String} name 조직의 이름
 * @property {number} parentId 조직의 상위 조직의 ID
 * @property {number} depth 조직의 깊이값
 */


/**
 *
 * @param {OrganizationDataSet} htDataSet
 * @constructor
 */
naver.model.Organization = function (htDataSet) {
    this.nId = htDataSet.id;
    this.sName = htDataSet.name;
    this.nParentId = htDataSet.parentId;
    this.nDepth = htDataSet.depth;

    this._aChildren = [];
}

naver.model.Organization.prototype = {
    /**
     * 하위 조직 리스트를 반환한다
     * @returns {Array.<naver.model.Organization>}
     */
    getChildren : function () {
        return this._aChildren;
    },

    /**
     * 하위 조직을 추가한다
     * @param {naver.model.Organization} oOrganization
     */
    appendChild : function (oOrganization) {
        this._aChildren.push(oOrganization);
    },

    /**
     * 자식 노드가 있는지 판단한다
     * @returns {boolean}
     */
    hasChildren : function () {
        return this._aChildren.length > 0;
    },

    /**
     * 최상위 조직인지 판단한다
     * @returns {boolean}
     */
    isRoot : function () {
        return this.nParentId === -1;
    },

    /**
     * 하위 조직을 삭제한다
     * @param oOrganization
     */
    removeChild : function (oOrganization) {
        this._aChildren = _.without(this._aChildren, oOrganization);
    }

}