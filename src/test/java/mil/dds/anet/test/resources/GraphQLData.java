package mil.dds.anet.test.resources;

public class GraphQLData<T> {
	private T payload;

	public T getPayload() {
		return payload;
	}

	public void setPayload(T payload) {
		this.payload = payload;
	}
}
