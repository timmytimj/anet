package mil.dds.anet.search;

import mil.dds.anet.beans.Organization;
import mil.dds.anet.beans.lists.AnetBeanList;
import mil.dds.anet.beans.search.AbstractBatchParams;
import mil.dds.anet.beans.search.ISearchQuery.RecurseStrategy;
import mil.dds.anet.beans.search.ISearchQuery.SortOrder;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.database.OrganizationDao;
import mil.dds.anet.database.mappers.OrganizationMapper;
import ru.vyarus.guicey.jdbi3.tx.InTransaction;

public abstract class AbstractOrganizationSearcher extends
    AbstractSearcher<Organization, OrganizationSearchQuery> implements IOrganizationSearcher {

  public AbstractOrganizationSearcher(
      AbstractSearchQueryBuilder<Organization, OrganizationSearchQuery> qb) {
    super(qb);
  }

  @InTransaction
  @Override
  public AnetBeanList<Organization> runSearch(OrganizationSearchQuery query) {
    buildQuery(query);
    return qb.buildAndRun(getDbHandle(), query, new OrganizationMapper());
  }

  @Override
  protected void buildQuery(OrganizationSearchQuery query) {
    qb.addSelectClause(OrganizationDao.ORGANIZATION_FIELDS);
    qb.addTotalCount();
    qb.addFromClause("organizations");

    if (hasTextQuery(query)) {
      addTextQuery(query);
    }

    if (query.isBatchParamsPresent()) {
      addBatchClause(query);
    }

    qb.addEqualsClause("status", "organizations.status", query.getStatus());
    qb.addEqualsClause("type", "organizations.type", query.getType());

    if (query.getHasParentOrg() != null) {
      if (query.getHasParentOrg()) {
        qb.addWhereClause("organizations.\"parentOrgUuid\" IS NOT NULL");
      } else {
        qb.addWhereClause("organizations.\"parentOrgUuid\" IS NULL");
      }
    }

    if (query.getParentOrgUuid() != null) {
      addParentOrgUuidQuery(query);
    }

    addOrderByClauses(qb, query);
  }

  @SuppressWarnings("unchecked")
  protected void addBatchClause(OrganizationSearchQuery query) {
    qb.addBatchClause(
        (AbstractBatchParams<Organization, OrganizationSearchQuery>) query.getBatchParams());
  }

  protected void addParentOrgUuidQuery(OrganizationSearchQuery query) {
    if (RecurseStrategy.CHILDREN.equals(query.getOrgRecurseStrategy())
        || RecurseStrategy.PARENTS.equals(query.getOrgRecurseStrategy())) {
      qb.addRecursiveClause(null, "organizations", "\"uuid\"", "parent_orgs", "organizations",
          "\"parentOrgUuid\"", "parentOrgUuid", query.getParentOrgUuid(),
          RecurseStrategy.CHILDREN.equals(query.getOrgRecurseStrategy()));
    } else {
      qb.addInListClause("parentOrgUuid", "organizations.\"parentOrgUuid\"",
          query.getParentOrgUuid());
    }
  }

  protected void addOrderByClauses(AbstractSearchQueryBuilder<?, ?> qb,
      OrganizationSearchQuery query) {
    switch (query.getSortBy()) {
      case CREATED_AT:
        qb.addAllOrderByClauses(getOrderBy(query.getSortOrder(), "organizations", "\"createdAt\""));
        break;
      case TYPE:
        qb.addAllOrderByClauses(getOrderBy(query.getSortOrder(), "organizations", "type"));
        break;
      case NAME:
      default:
        qb.addAllOrderByClauses(getOrderBy(query.getSortOrder(), "organizations", "\"shortName\"",
            "\"longName\"", "\"identificationCode\""));
        break;
    }
    qb.addAllOrderByClauses(getOrderBy(SortOrder.ASC, "organizations", "uuid"));
  }

}
