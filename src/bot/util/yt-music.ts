import YTMusic from "ytmusic-api";

const ytmusic = new YTMusic();

const initialiseYtMusic = async () => {
    await ytmusic.initialize();
};

export { ytmusic, initialiseYtMusic };