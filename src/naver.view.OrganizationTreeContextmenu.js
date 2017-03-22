

naver.view.OrganizationTreeContextmenu = function (oOrganizationTree) {
    this._oOrganizationTree = oOrganizationTree;

    this._oCollection = this._oOrganizationTree._oCollection;
    this.welOrganizations = this._oOrganizationTree.welOrganizations;
    this.welTreeSet = this._oOrganizationTree.welTreeSet;
    this.welTitleSet = this._oOrganizationTree.welTitleSet;

    this._welTargetOrganization = null;
    this._isShowingMenu = false;
    this._bindEvents();
}

naver.view.OrganizationTreeContextmenu.prototype = {

    /**
     * 조직도 트리를 렌더링한다
     */
    render : function () {
        this._oOrganizationTree.render();
    },

    getElementNodeById : function (nId) {
        return this._oOrganizationTree.getElementNodeById(nId);
    },

    getElementListById : function (nId) {
        return this._oOrganizationTree.getElementListById(nId);
    },

    createNode : function () {
        this._oOrganizationTree.createNode();
    },

    renameNode  : function (nId) {
        this._oOrganizationTree.renameNode(nId);
    },

    removeNode : function (nId) {
        this._oOrganizationTree.removeNode(nId);
    },

    _bindEvents : function () {
        this.welTreeSet.on('contextmenu', 'a.link', $.proxy(this._onContextMenuOrganization, this));
        $(document).on('click', $.proxy(this._onClickDocument, this));

        this.welOrganizations.children('.context_menu').on('click', 'button', $.proxy(this._onClickContextMenuButton, this));
    },

    _onContextMenuOrganization : function (oEvent) {
        oEvent.preventDefault();

        var htOffset = this.welOrganizations.offset();
        var welTargetOrganization = $(oEvent.currentTarget);
        var nId = welTargetOrganization.data('organization-id');

        if(!this._oCollection.find(nId).isRoot()) {
            this.welOrganizations.children('.context_menu').show().css({
                top : oEvent.clientY - htOffset.top,
                left : oEvent.clientX - htOffset.left
            });

            this._welTargetOrganization = $(oEvent.currentTarget);
            this._isShowingMenu = true;
        }


    },
    /**
     * 도큐먼트 이벤트 리스너 콘텍스트 메뉴를 감춘다
     * @private
     */
    _onClickDocument : function () {
        if(this._isShowingMenu) {
            this._isShowingMenu = false;
            this.welOrganizations.children('.context_menu').hide();
        }
    },

    _onClickContextMenuButton : function (oEvent) {
        var welMenuButton = $(oEvent.currentTarget),
            nTargetId =  this._welTargetOrganization.data('organization-id');
        if(welMenuButton.hasClass('change')){
            this.renameNode(nTargetId);
        }else{
            this.removeNode(nTargetId);
        }
    }

}