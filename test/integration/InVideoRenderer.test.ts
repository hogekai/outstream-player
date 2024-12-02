import { InvalidBidException } from "@/exception/InvalidBidException";
import { InVideoRenderer } from "@/InVideoRenderer";

vi.mock("fluid-player");

describe("In video renderer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '<div id="ad"></div>';
  });

  it("Rendering out-stream video advertisements", async () => {
    const div = document.getElementById("ad") as HTMLDivElement;
    Object.defineProperty(div, "offsetWidth", {
      get: vi.fn().mockReturnValue(640),
    });
    const sut = new InVideoRenderer();

    await sut.render("ad", {
      mediaType: "video",
      playerWidth: 640,
      playerHeight: 480,
      vastUrl: "https://example.com/vasturl",
    });

    expect(div.style.width).toBe("100%");
    expect(div.style.height).toBe("480px");
    expect(div.style.maxWidth).toBe("640px");
    expect(div.style.display).toBe("block");
  });

  it("Error with invalid mediaType", async () => {
    const sut = new InVideoRenderer();

    await expect(() =>
      sut.render("ad", {
        mediaType: "video",
        playerWidth: 640,
        playerHeight: 480,
        vastUrl: "<div>ad</div>",
      })
    ).rejects.toThrow(InvalidBidException);
  });
});
