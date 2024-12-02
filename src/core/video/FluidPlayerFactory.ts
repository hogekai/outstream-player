import { InvalidBidException } from "@/exception/InvalidBidException";
import { i18n } from "@/I18N";
import { fluidPlayer } from "@/lib/fluidPlayer";
import { FluidPlayerFactoryOptions } from "@/type";
import { isString, isUrl } from "@/util/validator";
import { encode } from "js-base64";

export class FluidPlayerFactory {
  private target: HTMLVideoElement;
  private options: FluidPlayerFactoryOptions;

  public constructor(
    target: HTMLVideoElement,
    options: FluidPlayerFactoryOptions
  ) {
    this.target = target;
    this.options = options;
  }

  public async create(rePlay: () => any): Promise<FluidPlayerInstance> {
    this.validateVastTags(this.options.vastUrl, this.options.vastXml);

    const player = fluidPlayer(this.target, {
      layoutControls: {
        // @ts-ignore
        roundedCorners: 8,
        fillToContainer: true,
        autoPlay: false,
        mute: true,
        doubleclickFullscreen: false,
        keyboardControl: false,
        loop: false,
        allowTheatre: false,
        miniPlayer: {
          enabled: false,
        },
        preload: "auto",
        persistentSettings: {
          volume: false,
          quality: false,
          speed: false,
          theatre: false,
        },
        layout: "in-renderer-js",
        logo: {
          imageUrl: this.options.logo?.imageUrl,
          clickUrl: this.options.logo?.clickUrl,
          position: "bottom left"
        }
      },
      vastOptions: {
        allowVPAID: true,
        showPlayButton: true,
        adList: [
          {
            adText: i18n.t('LearnMore'),
            adClickable: true,
            roll: "preRoll",
            vastTag: this.getVastUrl(this.options.vastUrl),
            fallbackVastTags: [this.getVastDataUrl(this.options.vastXml)],
          },
        ],
        vastAdvanced: {
          vastVideoEndedCallback: () => {
            this.attachEndCard(player, rePlay);
          },
        },
      },
    });

    return player;
  }

  private attachEndCard(player: FluidPlayerInstance, rePlay: () => any) {
    const container = this.getFluidContainer();
    this.target.style.filter = "blur(8px)";

    this.removeVolumeButtons(container);

    const { endCard, replayButton } = this.createReplayButtonElement();

    replayButton.addEventListener("click", () => {
      player.destroy();
      rePlay();
    });

    const fluidPlayerContainer = this.target.parentElement as HTMLDivElement;
    fluidPlayerContainer.appendChild(endCard);
  }

  private removeVolumeButtons(container: HTMLDivElement) {
    const volumeButton = container.querySelector(".fluid_button_volume");
    const muteButton = container.querySelector(".fluid_button_mute");

    volumeButton?.remove();
    muteButton?.remove();
  }

  private createReplayButtonElement(): {
    endCard: HTMLDivElement;
    replayButton: HTMLDivElement;
  } {
    const endCard = document.createElement("div");
    endCard.classList.add("ad_end_card");

    const replayButton = document.createElement("div");
    replayButton.classList.add("ad_replay");

    const replayIcon = document.createElement("div");
    replayIcon.classList.add("ad_replay_icon");
    replayButton.appendChild(replayIcon);

    const replayText = document.createElement("span");
    replayText.textContent = i18n.t('Replay');
    replayButton.appendChild(replayText);

    endCard.appendChild(replayButton);

    return {
      endCard: endCard,
      replayButton: replayButton,
    };
  }

  private getFluidContainer() {
    return this.target.parentElement as HTMLDivElement;
  }

  private validateVastTags(vastUrl?: string, vastXml?: string) {
    if (!this.isValidVastUrl(vastUrl) && !this.isValidVastXml(vastXml)) {
      throw new InvalidBidException();
    }
  }

  private getVastUrl(vastUrl?: string): string {
    if (this.isValidVastUrl(vastUrl)) {
      return vastUrl;
    }

    return "data:text/xml;charset=utf-8;base64,";
  }

  private getVastDataUrl(vastXml?: string): string {
    if (this.isValidVastXml(vastXml)) {
      return this.getVastDataUrlFromVastXml(vastXml);
    }

    return "data:text/xml;charset=utf-8;base64,";
  }

  private isValidVastUrl(vastUrl?: string): vastUrl is string {
    return !!(vastUrl && isString(vastUrl) && isUrl(vastUrl));
  }

  private isValidVastXml(vastXml?: string): vastXml is string {
    return !!(vastXml && isString(vastXml) && vastXml.search(/<VAST/gi) !== -1);
  }

  private getVastDataUrlFromVastXml(vastXml: string): string {
    return (
      "data:text/xml;charset=utf-8;base64," +
      encode(vastXml.replace(/\\"/g, '"'))
    );
  }
}
