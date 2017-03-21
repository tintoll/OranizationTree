/**
 *
 * @param sSelector
 * @param oCollection
 * @constructor
 */
naver.view.OrganizationTree = function (sSelector, oCollection) {
    this._sSelector = sSelector;
    this._oCollection = oCollection;

    this._assignElements();
    this.render();
};

naver.view.OrganizationTree.prototype = {

    _renderRootOrganization: function () {
        this.welTreeSet.html(this._tmplRootNode({
            company: this._oCollection.find(this._oCollection.COMPANY_NODE),
            unspecified: this._oCollection.find(this._oCollection.UNSPECIFIED_NODE)
        }));
    },

    _renderPlainOrganization: function () {
        var oSelf = this,
            welList = this.welTreeSet.find('ul.list');

        this._oCollection.each(function (oOrganization) {
            if (!oOrganization.isRoot()) {
                var welParent = welList.find('a[data-organization-id=' + oOrganization.nParentId + ']'),
                    welOrganization = $(oSelf._tmplPlainNode({organization: oOrganization}));

                if (welParent.length === 0) {
                    welList.append(welOrganization);
                } else {
                    welParent.siblings('ul').append(welOrganization);
                }

            }
        });
    },

    /**
     * 조직도 트리를 렌더링 한다.
     */
    render : function () {
        this._renderRootOrganization();
        this._renderPlainOrganization();
    },
    /**
     * 요소를 할당한다
     * @private
     */
    _assignElements : function () {
        this.welOrganizations = $(this._sSelector);
        this.welTitleSet = this.welOrganizations.children('.title_set');
        this.welTreeSet = this.welOrganizations.children('.tree_set');
        this._tmplRootNode = _.template($('#tmpl_root_node')[0].innerHTML);
        this._tmplPlainNode = _.template($('#tmpl_plain_node')[0].innerHTML);
    }

}
