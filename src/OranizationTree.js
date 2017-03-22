/**
 * 빌더함수
 * @example
 * var oOrganizationTree = organizationTree({
 *  sApiUrl : '/api/organizations',
 *  sSelector : '.snb_organization',
 *  useContextMenu : true
 *
 * });
 *
 * @param htOptions
 * @returns {naver.view.OrganizationTree}
 */
var organizationTree = function (htOptions) {
    var oOrganizations = new naver.collection.Organization(htOptions.sApiUrl),
        oOrganizationTree = new naver.view.OrganizationTree(htOptions.sSelector, oOrganizations);

        if(htOptions.useContextMenu){
            oOrganizationTreeContextMenu = new naver.view.OrganizationTreeContextmenu((oOrganizationTree))    ;
        }
    return oOrganizationTree;
}