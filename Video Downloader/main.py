from moviepy.editor import *
from pytube import YouTube
import ffmpeg
import os

SAVE_PATH = "/home/santiago/Downloads/PVD"
TEMPORARY_PATH = "/tmp"

FILENAME_PATH = "/{}{}"
FILENAME_ONLY_AUDIO = "(Audio Only) {}"

NUMBER_OF_TRIES = 0
MAX_NUMBER_OF_TRIES = 3
FORMAT_SELECTION_OPTIONS = 3

RESOLUTION_LIST = [
    "144p",
    "240p",
    "360p",
    "480p",
    "720p",
    "1080p",
    "1440p",
    "2160p",
]

URL_INPUT_MESSAGE = "Please paste the YouTube URL: "
DOWNLOAD_ANOTHER_MESSAGE = "Download Another one? (y/n): "
DOWNLOADING_MESSAGE = "Donwloading..."
CLEANING_UP_MESSAGE = "Cleaning Up..."
FORMAT_SELECTION_MESSAGE = "Please select a format:\n 1. Audio Only (MP3)\n 2. Audio and Video (MP4)\n 3. Exit\n"
RESOLUTION_SELECTION_MESSAGE = "Please select a resolution:"
RESOLUTION_SELECTION_ITEM_MESSAGE = " {}. {}"
RESOLUTION_SELECTION_ITEM_MESSAGE_PROGRESSIVE = " {}. {} (Faster Download)"
ERROR_MESSAGE = "{} (enter to continue)"

FETCHING_ERROR_MESSAGE = "An error occurred, retrying..."
YOUTUBE_URL_ERROR_MESSAGE = "Could not recognize Youtube URL, please verify it and try again."
SELECTION_TYPE_ERROR_MESSAGE = "Please input an integer."
WARNING_TYPE_ERROR_MESSAGE = "Please select either yes (Y) or no (N)."
FORMAT_SELECTION_RANGE_ERROR_MESSAGE = "Please select one of the listed format options."
RESOLUTION_SELECTION_RANGE_ERROR_MESSAGE = "Please select one of the listed resolutions."

VIDEO_NOT_PROGRESSIVE_WARNING_MESSAGE = "The video resolution selected does not include audio, downloading it will take a bit longer, do you wish to continue (y/n): "

MP3_EXTENSION = ".mp3"
MP4_EXTENSION = ".mp4"
YOUTUBE_URL = "https://www.youtube.com/watch?v="
YOUTUBE_URL_SHORT = "https://youtu.be/"

YES = "y"
NO = "n"
UPPER_CASE_YES = "Y"
UPPER_CASE_NO = "N"
CLEAR = "clear"

WINDOWS_OS_NAME = "nt"
LINUX_OS_NAME = "posix"
WIN_CLEAR = "cls"
LINUX_CLEAR = "clear"

def clear():
    if (os.name == WINDOWS_OS_NAME):
        os.system(WIN_CLEAR)
    elif (os.name == LINUX_OS_NAME):
        os.system(LINUX_CLEAR)

def show_error_message(message):
    input(ERROR_MESSAGE.format(message))
    clear()

def show_warning(message):
    clear()
    _continue = input(message)

    if (_continue == YES or _continue == UPPER_CASE_YES):
        return True
    elif (_continue == NO or _continue == UPPER_CASE_NO):
        return False
    else:
        show_error_message(WARNING_TYPE_ERROR_MESSAGE)

def show_information(message):
    clear()
    print(message)

def show_format_selection_input():
    clear()
    _prompt = input(FORMAT_SELECTION_MESSAGE)
    clear()

    try:
        _prompt = int(_prompt) - 1

        if (_prompt in range(FORMAT_SELECTION_OPTIONS)):
            return _prompt
        else:
            show_error_message(FORMAT_SELECTION_RANGE_ERROR_MESSAGE)

    except ValueError:
        show_error_message(SELECTION_TYPE_ERROR_MESSAGE)
        
    return show_format_selection_input()

def get_supported_video_resolutions(video):
    supported_resolutions = []
    progressive_resolutions = []

    for resolution in RESOLUTION_LIST:
        video_streams = video.streams
        
        if (video_streams.filter(resolution=resolution).first() != None):
            supported_resolutions.append(resolution)

        if (video_streams.filter(progressive=True, resolution=resolution).first() != None):
            progressive_resolutions.append(resolution)

    return supported_resolutions, progressive_resolutions

def show_resolution_selection_input(video):
    clear()
    supported_resolutions, progressive_resolutions = get_supported_video_resolutions(video)

    print(RESOLUTION_SELECTION_MESSAGE)

    for i in range(len(supported_resolutions)):
        if (supported_resolutions[i] in progressive_resolutions):
            resolution_message = RESOLUTION_SELECTION_ITEM_MESSAGE_PROGRESSIVE
        else:
            resolution_message = RESOLUTION_SELECTION_ITEM_MESSAGE

        print(resolution_message.format(i + 1, supported_resolutions[i]))

    _resolution = input()
    clear()

    try:
        _resolution = int(_resolution) - 1

        if (_resolution in range(len(supported_resolutions))):
            return supported_resolutions[_resolution], progressive_resolutions
        else:
            show_error_message(RESOLUTION_SELECTION_RANGE_ERROR_MESSAGE)

    except ValueError:
        show_error_message(SELECTION_TYPE_ERROR_MESSAGE)
        
    return show_resolution_selection_input(supported_resolutions)

def remove_temporary_files(files):
    show_information(CLEANING_UP_MESSAGE)

    for file in files:
        os.remove(file)

def convert_mp4_to_mp3(mp4_filename):
    return mp4_filename.split(MP4_EXTENSION, 1)[0] + MP3_EXTENSION

def download_audio(video):
    mp4_filename = video.streams.get_highest_resolution().download(TEMPORARY_PATH)
    mp4_audio_filename = video.streams.filter(only_audio=True).first().download(SAVE_PATH, filename=video.title)
    mp3_audio_filename = convert_mp4_to_mp3(mp4_audio_filename)
    os.rename(mp4_audio_filename, mp3_audio_filename)
    
    remove_temporary_files([mp4_filename])    

def download_not_progressive_video(video, resolution):
    mp4_filename = video.streams.filter(resolution=resolution).first().download(TEMPORARY_PATH)
    mp4_audio_filename = video.streams.filter(only_audio=True).first().download(filename=FILENAME_ONLY_AUDIO.format(video.title))
    mp3_audio_filename = convert_mp4_to_mp3(mp4_audio_filename)
    os.rename(mp4_audio_filename, mp3_audio_filename)

    input_video = ffmpeg.input(mp4_filename)
    input_audio = ffmpeg.input(mp3_audio_filename)

    ffmpeg.concat(input_video, input_audio, v=1, a=1).output(SAVE_PATH + FILENAME_PATH.format(video.title, MP4_EXTENSION)).run()

    remove_temporary_files([mp4_filename, mp3_audio_filename])    
    
def download_video(video):
    _resolution, progressive_resolutions = show_resolution_selection_input(video)

    if (_resolution in progressive_resolutions):
        video.streams.filter(progressive=True, resolution=_resolution).first().download(SAVE_PATH)
        
    else:
        if (show_warning(VIDEO_NOT_PROGRESSIVE_WARNING_MESSAGE)):
            download_not_progressive_video(video, _resolution)

            

def download_files(url):
    try:
        youtube_video = YouTube(url)
        _file_format = show_format_selection_input()

        show_information(DOWNLOADING_MESSAGE)

        if (_file_format == 0):
            download_audio(youtube_video)
        elif (_file_format == 1):
            download_video(youtube_video)
        else:
            return

        if (show_warning(DOWNLOAD_ANOTHER_MESSAGE)):
            get_url()
        else:
            return

    except Exception as exception:
        if (NUMBER_OF_TRIES <= MAX_NUMBER_OF_TRIES):
            show_information(FETCHING_ERROR_MESSAGE)
            download_files(url)

        else:
            show_information(exception)

def check_url(url):
    if (YOUTUBE_URL in url or YOUTUBE_URL_SHORT in url):
        download_files(url)

    else:
        show_error_message(YOUTUBE_URL_ERROR_MESSAGE)
        get_url()

def get_url():
    clear()
    _video_url = input(URL_INPUT_MESSAGE)
    check_url(_video_url)

get_url()