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
    this._bindEvents();
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
    },

    /**
     * 이벤트를 바인드 한다
     * @private
     */
    _bindEvents : function () {
        this.welTreeSet.on('click','a.link', $.proxy(this._onClickSelectOrganization, this));

        this.welTreeSet.on('click','a.link', $.proxy(this._onClickOpenCloseOrganization, this));

        this.welTreeSet.on('click','input.edit_name', $.proxy(this._onClickInputName, this));
        this.welTreeSet.on('keyup','input.edit_name', $.proxy(this._onKeyupInputName, this));
        this.welTreeSet.on('focusout','input.edit_name', $.proxy(this._onFocusoutInputName, this));
        this.welTitleSet.on('click','button', $.proxy(this._onClickAddOrganization, this));

    },

    _onClickAddOrganization : function () {
        this.createNode();
    },

    /**
     * 이름 입력란 클릭 이벤트 리스너
     * @param oEvent
     * @private
     */
    _onClickInputName : function (oEvent) {
        oEvent.stopPropagation();
    },
    /**
     * 이름 입력란 keyup 이벤트 리스너
     * @param oEvent
     * @private
     */
    _onKeyupInputName : function (oEvent) {
        var nEnterKey = 13;

        if(oEvent.keyCode === nEnterKey) {
            $(oEvent.currentTarget).blur();
        }
    },

    _onFocusoutInputName : function (oEvent) {
      var welInputName = $(oEvent.currentTarget),
          welOrganization = welInputName.parents('a.link'),
          sNewName = welInputName.val(),
          nId = welOrganization.data('organization-id');

        welOrganization.removeClass('editing');
        this._oCollection.rename(nId, sNewName).done(function () {
            welOrganization.find('span.name').html(sNewName);
        }).fail(function (oError) {
            alert(oError.responseText);
        });
    },

    _onClickSelectOrganization : function (oEvent) {
        var welOrganization = $(oEvent.currentTarget);

        this.welOrganizations.find('a.link').removeClass('selected');
        welOrganization.addClass('selected');
    },
    /**
     * 조직 요소를 찾아서 반환한다
     * @param nId
     * @returns {*|{}}
     */
    getElementNodeById : function (nId) {
      return this.welTreeSet.find('a[data-organization-id='+nId+']');
    },

    getElementListById : function (nId) {
      var welOrganization = this.getElementNodeById(nId),
          welChildrenList = welOrganization.siblings('ul');

      if(this._oCollection.find(nId).isRoot()) {
          welChildrenList = welOrganization.parents('h4').siblings('ul');
      }
      return welChildrenList;
    },

    _onClickOpenCloseOrganization : function (oEvent) {
        var nId = $(oEvent.currentTarget).data('organization-id'),
            welOrganization = this.getElementNodeById(nId),
            welChildrenList = this.getElementListById(nId),
            welButton = welOrganization.siblings('button');

        if(this._oCollection.find(nId).hasChildren()) {
            welOrganization.toggleClass('opened_child');
            welChildrenList.toggleClass('opened');
            welButton.html('폴더 열기');
            if(welOrganization.hasClass('opened_child')){
                welButton.html('폴더 닫기');
            }
        }
    },
    /**
     * 현재 선택된 노드에 새 조직을 생성한다
     */
    createNode : function () {
        var welOrganization = this.welTreeSet.find('a.selected'),
            nId = welOrganization.data('organization-id'),
            welChildrenList = this.getElementListById(nId),
            welButton = welOrganization.siblings('button'),
            oSelf = this;
        this._oCollection.create(nId).done(function (oNewOrganization) {
            welChildrenList.append(oSelf._tmplPlainNode({organization: oNewOrganization}));
            welOrganization.addClass('has_child opened_child');
            welChildrenList.addClass('opened');
            welButton.html('폴더 닫기');
            oSelf.renameNode(oNewOrganization.nId);
        }).fail(function (error) {
            alert(error.responseText);
        });
    },


    renameNode : function (nId) {
        var welOrganization = this.getElementNodeById(nId),
            oOrganization = this._oCollection.find(nId);
        if(!oOrganization.isRoot()){
            welOrganization.addClass('editing');
            welOrganization.find('input').focus();
        }
    },


    removeNode : function (nId) {
        var oOrganization = this._oCollection.find(nId),
            oParent = this._oCollection.find(oOrganization.nParentId),
            welOrganization = this.getElementNodeById(nId),
            welParent = this.getElementNodeById(oParent.id);

        this._oCollection.remove(nId).done(function () {
            welOrganization.parent('li').remove();
            if(!oParent.hasChildren()) {
                welParent.removeClass('has_child opened_child').siblings('ul').removeClass('opened');
            }
        }).fail(function (oError) {
            alert(oError.responseText);
        });
    }


}
