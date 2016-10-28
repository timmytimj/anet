package mil.dds.anet.database;

import java.util.List;
import java.util.Map;

import org.skife.jdbi.v2.GeneratedKeys;
import org.skife.jdbi.v2.Handle;
import org.skife.jdbi.v2.Query;

import mil.dds.anet.beans.AdvisorOrganization;
import mil.dds.anet.beans.Group;
import mil.dds.anet.database.mappers.AdvisorOrganizationMapper;

public class AdvisorOrganizationDao implements IAnetDao<AdvisorOrganization> {

	Handle dbHandle;
	GroupDao groupDao;
	
	public AdvisorOrganizationDao(Handle dbHandle, GroupDao groupDao) { 
		this.dbHandle = dbHandle;
		this.groupDao = groupDao;
	}
	
	public List<AdvisorOrganization> getAll(int pageNum, int pageSize) {
		Query<AdvisorOrganization> query = dbHandle.createQuery("SELECT * from advisorOrganizations ORDER BY createdAt ASC LIMIT :limit OFFSET :offset")
			.bind("limit", pageSize)
			.bind("offset", pageSize * pageNum)
			.map(new AdvisorOrganizationMapper());
		return query.list();
	}
	
	public AdvisorOrganization getById(int id) { 
		Query<AdvisorOrganization> query = dbHandle.createQuery(
				"Select * from advisorOrganizations where id = :id")
			.bind("id",id)
			.map(new AdvisorOrganizationMapper());
		List<AdvisorOrganization> results = query.list();
		return (results.size() == 0) ? null : results.get(0);
	}
	
	public AdvisorOrganization insert(AdvisorOrganization ao) {
		Group g = new Group();
		g.setName(ao.getName() + " Members");
		g = groupDao.insert(g);
		
		GeneratedKeys<Map<String,Object>> keys = dbHandle.createStatement(
				"INSERT INTO advisorOrganizations (name, memberGroupId) VALUES (:name, :memberGroupId)")
			.bind("name", ao.getName())
			.bind("memberGroupId", g.getId())
			.executeAndReturnGeneratedKeys();
		
		ao.setId(((Integer)keys.first().get("last_insert_rowid()")).intValue());
		ao.setMemberGroupId(g.getId());
		return ao;
	}
	
	public int update(AdvisorOrganization ao) { 
		int numRows = dbHandle.createStatement("UPDATE advisorOrganizations SET name = :name where id = :id")
				.bind("name", ao.getName())
				.bind("id", ao.getId())
				.execute();
		
		Group g = new Group();
		g.setId(ao.getMemberGroupId());
		g.setName(ao.getName() + " Members");
		groupDao.update(g);
		
		return numRows;
	}
	
	public void deleteAdvisorOrganization(AdvisorOrganization ao) { 
		groupDao.deleteGroup(ao.getMemberGroupId());
		
		dbHandle.createStatement("DELETE from advisorOrganizations where id = :id")
			.bind("id", ao.getId())
			.execute();
	}
}
