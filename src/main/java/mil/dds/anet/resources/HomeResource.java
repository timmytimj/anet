package mil.dds.anet.resources;

import java.util.HashMap;

import javax.annotation.security.PermitAll;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import io.dropwizard.auth.Auth;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.beans.search.OrganizationSearchQuery;
import mil.dds.anet.beans.search.PersonSearchQuery;
import mil.dds.anet.beans.search.PoamSearchQuery;
import mil.dds.anet.beans.search.PositionSearchQuery;
import mil.dds.anet.beans.search.ReportSearchQuery;
import mil.dds.anet.database.AdminDao.AdminSettingKeys;
import mil.dds.anet.views.IndexView;

@Path("")
@PermitAll
public class HomeResource {

	@GET
	@Path("{path: .*}")
	@Produces(MediaType.TEXT_HTML)
	public IndexView reactIndex(@Auth Person p) {
		IndexView view = new IndexView("/views/index.ftl");
		view.setCurrentUser(p);
		
		AnetObjectEngine engine = AnetObjectEngine.getInstance();
		view.setSecurityBannerText(engine.getAdminSetting(AdminSettingKeys.SECURITY_BANNER_TEXT));
		view.setSecurityBannerColor(engine.getAdminSetting(AdminSettingKeys.SECURITY_BANNER_COLOR));
		
		return view;
	}

	public static String ALL_TYPES = "people,reports,positions,poams,locations,organizations";

	@GET
	@Path("/api/search")
	@Produces(MediaType.APPLICATION_JSON)
	public HashMap<String, Object> search(@QueryParam("q") String query, @QueryParam("types") String types) {
		if (types == null) { types = ALL_TYPES;}
		types = types.toLowerCase();

		HashMap<String, Object> result = new HashMap<String, Object>();

		if (types.contains("people")) {
			result.put("people", AnetObjectEngine.getInstance().getPersonDao().search(PersonSearchQuery.withText(query)));
		}
		if (types.contains("reports")) {
			result.put("reports", AnetObjectEngine.getInstance().getReportDao().search(ReportSearchQuery.withText(query)));
		}
		if (types.contains("positions")) {
			result.put("positions", AnetObjectEngine.getInstance().getPositionDao().search(PositionSearchQuery.withText(query)));
		}
		if (types.contains("poams")) {
			result.put("poams", AnetObjectEngine.getInstance().getPoamDao().search(PoamSearchQuery.withText(query)));
		}
		if (types.contains("locations")) {
			result.put("locations", AnetObjectEngine.getInstance().getLocationDao().search(LocationSearchQuery.withText(query)));
		}
		if (types.contains("organizations")) { 
			result.put("organizations", AnetObjectEngine.getInstance().getOrganizationDao().search(OrganizationSearchQuery.withText(query)));
		}

		return result;
	}
}
