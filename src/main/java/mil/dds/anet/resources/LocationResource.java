package mil.dds.anet.resources;

import io.leangen.graphql.annotations.GraphQLArgument;
import io.leangen.graphql.annotations.GraphQLMutation;
import io.leangen.graphql.annotations.GraphQLQuery;
import io.leangen.graphql.annotations.GraphQLRootContext;
import java.util.Map;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response.Status;
import mil.dds.anet.AnetObjectEngine;
import mil.dds.anet.beans.Location;
import mil.dds.anet.beans.Person;
import mil.dds.anet.beans.lists.AnetBeanList;
import mil.dds.anet.beans.search.LocationSearchQuery;
import mil.dds.anet.database.LocationDao;
import mil.dds.anet.utils.AnetAuditLogger;
import mil.dds.anet.utils.AuthUtils;
import mil.dds.anet.utils.DaoUtils;

public class LocationResource {

  private final LocationDao dao;

  public LocationResource(AnetObjectEngine engine) {
    this.dao = engine.getLocationDao();
  }

  @GraphQLQuery(name = "location")
  public Location getByUuid(@GraphQLArgument(name = "uuid") String uuid) {
    Location loc = dao.getByUuid(uuid);
    if (loc == null) {
      throw new WebApplicationException("Location not found", Status.NOT_FOUND);
    }
    return loc;
  }

  @GraphQLQuery(name = "locationList")
  public AnetBeanList<Location> search(@GraphQLRootContext Map<String, Object> context,
      @GraphQLArgument(name = "query") LocationSearchQuery query) {
    query.setUser(DaoUtils.getUserFromContext(context));
    return dao.search(query);
  }

  @GraphQLMutation(name = "createLocation")
  public Location createLocation(@GraphQLRootContext Map<String, Object> context,
      @GraphQLArgument(name = "location") Location l) {
    final Person user = DaoUtils.getUserFromContext(context);
    AuthUtils.assertSuperUser(user);
    if (l.getName() == null || l.getName().trim().length() == 0) {
      throw new WebApplicationException("Location name must not be empty", Status.BAD_REQUEST);
    }
    l = dao.insert(l);
    AnetAuditLogger.log("Location {} created by {}", l, user);
    return l;
  }

  @GraphQLMutation(name = "updateLocation")
  public Integer updateLocation(@GraphQLRootContext Map<String, Object> context,
      @GraphQLArgument(name = "location") Location l) {
    final Person user = DaoUtils.getUserFromContext(context);
    AuthUtils.assertSuperUser(user);
    final int numRows = dao.update(l);
    if (numRows == 0) {
      throw new WebApplicationException("Couldn't process location update", Status.NOT_FOUND);
    }
    AnetAuditLogger.log("Location {} updated by {}", l, user);
    // GraphQL mutations *have* to return something, so we return the number of updated rows
    return numRows;
  }

}
