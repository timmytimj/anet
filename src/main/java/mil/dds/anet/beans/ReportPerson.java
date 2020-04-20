package mil.dds.anet.beans;

import io.leangen.graphql.annotations.GraphQLInputField;
import io.leangen.graphql.annotations.GraphQLQuery;
import java.util.*;

public class ReportPerson extends Person {

  @GraphQLQuery
  @GraphQLInputField
  boolean primary;

  @GraphQLQuery
  @GraphQLInputField
  List<Report> conflictedReports;

  public ReportPerson() {
    this.primary = false; // Default
  }

  public boolean isPrimary() {
    return primary;
  }

  public void setPrimary(boolean primary) {
    this.primary = primary;
  }

  public List<Report> getConflictedReports() {
    return conflictedReports != null ? conflictedReports : new ArrayList<>();
  }

  public void setConflictedReports(List<Report> conflictedReports) {
    this.conflictedReports = conflictedReports;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof ReportPerson))
      return false;
    if (!super.equals(o))
      return false;
    ReportPerson that = (ReportPerson) o;
    return isPrimary() == that.isPrimary()
        && getConflictedReports().equals(that.getConflictedReports());
  }

  @Override
  public int hashCode() {
    return Objects.hash(super.hashCode(), isPrimary(), getConflictedReports());
  }

}
